import os
import time
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from app.config import settings
from app.rag.extractor import DocumentExtractor
from app.rag.vector_store import vector_store_instance
from app.rag.analyzer import ContractAnalyzer

router = APIRouter(prefix="/docs", tags=["Documents"])

DB_DOCS = [
    {
        "id": "doc-001",
        "filename": "Senior_Software_Engineer_Employment_Agreement.pdf",
        "file_type": "pdf",
        "upload_date": "2026-07-20 10:30",
        "file_size": "2.4 MB",
        "chunk_count": 24,
        "status": "indexed",
        "risk_score": 68,
        "is_scanned_ocr": False
    },
    {
        "id": "doc-002",
        "filename": "Commercial_Office_Lease_Agreement_2026.pdf",
        "file_type": "pdf",
        "upload_date": "2026-07-22 14:15",
        "file_size": "4.1 MB",
        "chunk_count": 38,
        "status": "indexed",
        "risk_score": 42,
        "is_scanned_ocr": True
    },
    {
        "id": "doc-003",
        "filename": "SaaS_Enterprise_Master_Services_Agreement.docx",
        "file_type": "docx",
        "upload_date": "2026-07-24 16:40",
        "file_size": "1.8 MB",
        "chunk_count": 19,
        "status": "indexed",
        "risk_score": 25,
        "is_scanned_ocr": False
    }
]

class DocUploadJSONPayload(BaseModel):
    filename: str
    content: str
    file_type: Optional[str] = "pdf"

@router.get("/list")
def list_documents():
    return DB_DOCS

@router.post("/upload")
async def upload_document(request: Request):
    from app.routes.billing_routes import CURRENT_SUBSCRIPTION
    pdf_limit = CURRENT_SUBSCRIPTION.get("pdf_limit", 5)
    if pdf_limit != -1 and len(DB_DOCS) >= pdf_limit:
        raise HTTPException(
            status_code=402,
            detail=f"Quota Limit Reached: Free plan is capped at {pdf_limit} PDFs. Upgrade to Pro for unlimited document uploads."
        )

    content_type = request.headers.get("content-type", "")

    if "json" in content_type:
        data = await request.json()
        filename = data.get("filename", "Uploaded_Contract.pdf")
        text_content = data.get("content", "Sample legal document content.")
        ext = filename.split(".")[-1].lower()
    else:
        # Form or raw body
        try:
            form = await request.form()
            file = form.get("file")
            filename = getattr(file, "filename", "Contract_Document.pdf")
            ext = filename.split(".")[-1].lower()
            text_content = (await file.read()).decode("utf-8", errors="ignore") if hasattr(file, "read") else "Document content."
        except Exception:
            filename = "Uploaded_Contract.pdf"
            ext = "pdf"
            text_content = "Document text content."

    doc_id = f"doc-{int(time.time())}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    with open(file_path, "w", encoding="utf-8", errors="ignore") as f:
        f.write(text_content)

    extracted = {"file_type": ext, "page_count": 1, "pages": [{"page_number": 1, "text": text_content}], "is_scanned_ocr": False}
    chunks = DocumentExtractor.chunk_document(extracted, doc_id)
    vector_store_instance.add_chunks(chunks)

    risk_analysis = ContractAnalyzer.analyze_risks(chunks)
    summary = ContractAnalyzer.generate_summary(chunks)
    timeline = ContractAnalyzer.extract_timeline(chunks)

    doc_meta = {
        "id": doc_id,
        "filename": filename,
        "file_type": ext,
        "upload_date": time.strftime("%Y-%m-%d %H:%M"),
        "file_size": f"{len(text_content) / (1024*1024):.1f} MB" if len(text_content) > 1024*1024 else f"{max(0.1, round(len(text_content)/1024, 1))} KB",
        "chunk_count": len(chunks),
        "status": "indexed",
        "risk_score": risk_analysis["risk_score"],
        "is_scanned_ocr": False,
        "summary": summary,
        "risks": risk_analysis["risks"],
        "timeline": timeline
    }

    DB_DOCS.insert(0, doc_meta)

    # Broadcast real-time WebSocket notifications
    try:
        from app.routes.ws_routes import ws_manager
        import asyncio

        asyncio.create_task(ws_manager.broadcast({
            "event": "ocr_completed",
            "title": "OCR Complete ✔",
            "message": f"Text extraction & OCR processed for {filename}",
            "filename": filename,
            "timestamp": time.strftime("%H:%M:%S")
        }))

        asyncio.create_task(ws_manager.broadcast({
            "event": "risk_analysis_completed",
            "title": "Risk Analysis Finished ✔",
            "message": f"Contract risk analysis finished for {filename} (Risk Score: {doc_meta['risk_score']})",
            "filename": filename,
            "risk_score": doc_meta["risk_score"],
            "timestamp": time.strftime("%H:%M:%S")
        }))

        asyncio.create_task(ws_manager.broadcast({
            "event": "doc_indexed",
            "title": "Document Indexed ✔",
            "message": f"{filename} successfully indexed into FAISS Vector DB ({doc_meta['chunk_count']} chunks)",
            "filename": filename,
            "doc_id": doc_id,
            "timestamp": time.strftime("%H:%M:%S")
        }))
    except Exception as e:
        print(f"WebSocket broadcast notice: {e}")

    return doc_meta
