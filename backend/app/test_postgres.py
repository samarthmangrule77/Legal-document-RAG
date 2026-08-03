import os
import sys
import uuid
import datetime

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.db.database import engine, Base, SessionLocal
from app.db.models import (
    Workspace, Team, User, Document, ContractSummary, RiskReport,
    Chat, Message, AuditLog, Subscription, Invoice
)
from app.db.init_db import init_db

def test_database():
    print("=" * 60)
    print("RUNNING POSTGRESQL & RELATIONAL DATABASE VERIFICATION TEST")
    print("=" * 60)

    # 1. Initialize Tables & Seed Data
    init_db()

    db = SessionLocal()
    try:
        # 2. Test Workspace model
        ws = db.query(Workspace).filter(Workspace.is_deleted == False).first()
        assert ws is not None, "Workspace entity not found!"
        print(f"[OK] Workspace Verified: ID={ws.id}, Name='{ws.name}', LLM='{ws.ai_llm_model}'")

        # 3. Test Users model
        users = db.query(User).filter(User.is_deleted == False).all()
        assert len(users) >= 2, "Seeded users not found!"
        print(f"[OK] Users Verified: Count={len(users)}, First User='{users[0].name}' ({users[0].email})")

        # 4. Test Documents model & Relationships
        docs = db.query(Document).filter(Document.is_deleted == False).all()
        assert len(docs) >= 3, "Seeded documents not found!"
        print(f"[OK] Documents Verified: Count={len(docs)}, First Doc='{docs[0].filename}'")

        summary = db.query(ContractSummary).filter(ContractSummary.document_id == docs[0].id).first()
        assert summary is not None, "Contract summary relationship failed!"
        print(f"[OK] Contract Summary Verified: Parties={summary.parties}")

        risk = db.query(RiskReport).filter(RiskReport.document_id == docs[0].id).first()
        assert risk is not None, "Risk report relationship failed!"
        print(f"[OK] Risk Report Verified: Score={risk.overall_risk_score}, Level='{risk.risk_level}'")

        # 5. Test Chats & AI Response Messages
        chats = db.query(Chat).filter(Chat.is_deleted == False).all()
        assert len(chats) >= 1, "Seeded chat conversation not found!"
        msgs = db.query(Message).filter(Message.chat_id == chats[0].id, Message.is_deleted == False).all()
        assert len(msgs) >= 2, "Seeded chat messages not found!"
        print(f"[OK] Chats & AI Messages Verified: Chat Title='{chats[0].title}', Message Count={len(msgs)}")

        # 6. Test Subscription & Invoices
        sub = db.query(Subscription).filter(Subscription.is_deleted == False).first()
        assert sub is not None, "Subscription model not found!"
        invoices = db.query(Invoice).filter(Invoice.subscription_id == sub.id).all()
        print(f"[OK] Subscription & Invoices Verified: Plan='{sub.plan_name}', Invoices={len(invoices)}")

        # 7. Test Audit Logs
        logs = db.query(AuditLog).filter(AuditLog.is_deleted == False).all()
        assert len(logs) >= 2, "Audit logs not found!"
        print(f"[OK] Audit Logs Verified: Count={len(logs)}")

        # 8. Test Soft Delete functionality
        test_doc_id = str(uuid.uuid4())
        test_doc = Document(
            id=test_doc_id,
            workspace_id=ws.id,
            filename="Test_Delete_Contract.pdf",
            file_type="pdf",
            file_size_bytes=1024,
            status="indexed"
        )
        db.add(test_doc)
        db.commit()

        # Perform soft delete
        test_doc.soft_delete(db)
        db.commit()

        deleted_query = db.query(Document).filter(Document.id == test_doc_id, Document.is_deleted == False).first()
        assert deleted_query is None, "Soft delete failed! Document still returned in non-deleted query."
        
        soft_deleted_rec = db.query(Document).filter(Document.id == test_doc_id).first()
        assert soft_deleted_rec.is_deleted == True and soft_deleted_rec.deleted_at is not None, "Soft delete metadata missing!"
        print(f"[OK] Soft Delete Verified: Document ID={test_doc_id} soft deleted with timestamp {soft_deleted_rec.deleted_at.isoformat()}")

        # Cleanup soft delete test record
        db.delete(soft_deleted_rec)
        db.commit()

        print("=" * 60)
        print("ALL POSTGRESQL RELATIONAL SCHEMA TESTS PASSED SUCCESSFULLY!")
        print("=" * 60)

    except Exception as e:
        print(f"[FAIL] DATABASE TEST FAILED: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    test_database()
