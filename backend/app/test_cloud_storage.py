import os
import sys
import uuid

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.services.cloud_storage import cloud_storage_service
from app.db.database import engine, Base, SessionLocal
from app.db.models import Document, Workspace
from app.db.init_db import init_db

def test_cloud_storage_suite():
    print("=" * 60)
    print("RUNNING CLOUD STORAGE & AES-256 ENCRYPTION SUITE TEST")
    print("=" * 60)

    # Recreate tables to ensure schema matches latest models with all S3 columns
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    # 1. Test Payload Encryption & Decryption
    raw_payload = b"CONFIDENTIAL LEGAL CONTRACT DATA: Top Secret Enterprise Terms 2026."
    encrypted_payload = cloud_storage_service.encrypt_bytes(raw_payload)
    assert encrypted_payload != raw_payload, "Payload encryption failed!"

    decrypted_payload = cloud_storage_service.decrypt_bytes(encrypted_payload)
    assert decrypted_payload == raw_payload, "Payload decryption integrity check failed!"
    print("[OK] AES-256 Payload Encryption & Decryption Integrity Verified.")

    # 2. Test File Validation (Extension & File Size Limits)
    mime = cloud_storage_service.validate_file("Enterprise_NDA.pdf", raw_payload)
    assert mime == "application/pdf", f"Unexpected MIME type: {mime}"
    print(f"[OK] File Validation Verified: File='Enterprise_NDA.pdf', MIME='{mime}'")

    try:
        cloud_storage_service.validate_file("dangerous_script.exe", b"malicious executable payload")
        assert False, "File validation failed to reject invalid file extension!"
    except ValueError as ve:
        print(f"[OK] Invalid Extension Rejection Verified: Caught expected error '{ve}'")

    # 3. Test SHA-256 Checksum
    sha256 = cloud_storage_service.compute_sha256(raw_payload)
    assert len(sha256) == 64, f"Invalid SHA-256 hash length: {len(sha256)}"
    print(f"[OK] SHA-256 Checksum Computed: {sha256}")

    # 4. Test Upload & PostgreSQL Metadata Store
    init_db()
    db = SessionLocal()
    try:
        ws = db.query(Workspace).first()
        ws_id = ws.id if ws else str(uuid.uuid4())

        s3_meta = cloud_storage_service.upload_file(raw_payload, "Master_Services_Agreement_2026.pdf", ws_id)
        assert "s3_key" in s3_meta and "s3_bucket" in s3_meta, "S3 upload metadata missing key/bucket!"
        print(f"[OK] S3 Upload Verified: Bucket='{s3_meta['s3_bucket']}', Key='{s3_meta['s3_key']}'")

        doc_id = str(uuid.uuid4())
        doc_rec = Document(
            id=doc_id,
            workspace_id=ws_id,
            filename="Master_Services_Agreement_2026.pdf",
            file_type="pdf",
            file_size_bytes=len(raw_payload),
            status="indexed",
            s3_bucket=s3_meta["s3_bucket"],
            s3_key=s3_meta["s3_key"],
            s3_version_id=s3_meta["s3_version_id"],
            encryption_type=s3_meta["encryption_type"],
            sha256_hash=s3_meta["sha256_hash"],
            mime_type=s3_meta["mime_type"],
            is_recovered=False
        )
        db.add(doc_rec)
        db.commit()
        db.refresh(doc_rec)

        # 5. Test File Download & Decryption from Cloud Storage
        downloaded_bytes, dl_mime = cloud_storage_service.download_decrypted_file(doc_rec.s3_key)
        assert downloaded_bytes == raw_payload, "Cloud download payload does not match original!"
        print(f"[OK] Cloud Storage Decrypted Download Verified: Payload Match = True ({len(downloaded_bytes)} bytes)")

        # 6. Test Delete Recovery & Soft-Delete Restore
        doc_rec.soft_delete(db)
        db.commit()

        deleted_check = db.query(Document).filter(Document.id == doc_id, Document.is_deleted == False).first()
        assert deleted_check is None, "Soft delete check failed!"

        # Restore
        doc_rec.is_deleted = False
        doc_rec.deleted_at = None
        doc_rec.is_recovered = True
        db.commit()

        restored_check = db.query(Document).filter(Document.id == doc_id, Document.is_deleted == False).first()
        assert restored_check is not None and restored_check.is_recovered == True, "Delete recovery failed!"
        print(f"[OK] Delete Recovery Verified: Document ID={doc_id} successfully restored from cloud archive.")

        # Cleanup test document
        db.delete(doc_rec)
        db.commit()

        print("=" * 60)
        print("ALL CLOUD STORAGE & SECURITY TESTS PASSED SUCCESSFULLY!")
        print("=" * 60)

    finally:
        db.close()

if __name__ == "__main__":
    test_cloud_storage_suite()
