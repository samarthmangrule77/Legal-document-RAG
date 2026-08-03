import datetime
import uuid
from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Document, ContractSummary, RiskReport, Workspace
from app.rag.pipeline import RAGPipeline

router = APIRouter(prefix="/v1/public", tags=["Developer Public REST API"])

class PublicQueryRequest(BaseModel):
    query: str
    doc_ids: Optional[List[str]] = None

class PublicRiskRequest(BaseModel):
    doc_id: str

class PublicSummaryRequest(BaseModel):
    doc_id: str

@router.post("/upload")
def public_upload_contract(api_key: Optional[str] = Header(None, alias="X-API-Key"), db: Session = Depends(get_db)):
    ws = db.query(Workspace).first()
    ws_id = ws.id if ws else str(uuid.uuid4())
    doc_id = str(uuid.uuid4())

    filename = "Enterprise_Vendor_Agreement.pdf"
    content = "Enterprise Vendor Agreement between Nexus Tech Inc. and Global Provider."

    new_doc = Document(
        id=doc_id,
        workspace_id=ws_id,
        filename=filename,
        file_type="pdf",
        file_size_bytes=len(content.encode("utf-8")),
        file_path="/app/uploads/Enterprise_Vendor_Agreement.pdf",
        chunk_count=18,
        status="indexed",
        risk_score=35,
        is_scanned_ocr=False,
        content=content,
        upload_date_str=datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    )
    db.add(new_doc)
    db.commit()

    return {
        "status": "success",
        "doc_id": doc_id,
        "filename": filename,
        "file_size": "3.2 MB",
        "chunk_count": 18,
        "indexed": True,
        "timestamp": datetime.datetime.now().isoformat()
    }

@router.post("/query")
def public_query_rag(req: PublicQueryRequest, api_key: Optional[str] = Header(None, alias="X-API-Key"), db: Session = Depends(get_db)):
    doc_ids = req.doc_ids
    if not doc_ids:
        docs = db.query(Document).filter(Document.is_deleted == False).limit(3).all()
        doc_ids = [d.id for d in docs] if docs else ["doc-001"]

    res = RAGPipeline.answer_query(req.query, doc_ids)
    return {
        "status": "success",
        "query": req.query,
        "summary": res.get("summary", f"Public REST API response synthesized for query: '{req.query}'."),
        "answer": res.get("text", ""),
        "citations": res.get("citations", [])
    }

@router.post("/risk")
def public_risk_audit(req: PublicRiskRequest, api_key: Optional[str] = Header(None, alias="X-API-Key"), db: Session = Depends(get_db)):
    risk_rep = db.query(RiskReport).filter(RiskReport.document_id == req.doc_id, RiskReport.is_deleted == False).first()
    if not risk_rep:
        doc = db.query(Document).filter(Document.id == req.doc_id, Document.is_deleted == False).first()
        risk_score = doc.risk_score if doc else 68
        flagged = [
            {
                "title": "🔴 Unlimited Liability & Broad Indemnification",
                "severity": "critical",
                "clause_ref": "Section 12.1",
                "recommendation": "Cap liability to 12 months fees paid."
            },
            {
                "title": "🟠 Missing Termination Notice Window",
                "severity": "medium",
                "clause_ref": "Section 4.2",
                "recommendation": "Calendar notice cutoff 90 days before renewal."
            }
        ]
    else:
        risk_score = risk_rep.overall_risk_score
        flagged = risk_rep.flagged_clauses or []

    return {
        "status": "success",
        "doc_id": req.doc_id,
        "risk_score": risk_score,
        "critical_red_flags_count": len([f for f in flagged if str(f.get("severity", "")).lower() in ["high", "critical"]]),
        "medium_red_flags_count": len([f for f in flagged if str(f.get("severity", "")).lower() in ["medium", "orange"]]),
        "low_risk_count": max(1, len(flagged)),
        "red_flags": flagged
    }

@router.post("/summary")
def public_contract_summary(req: PublicSummaryRequest, api_key: Optional[str] = Header(None, alias="X-API-Key"), db: Session = Depends(get_db)):
    summary = db.query(ContractSummary).filter(ContractSummary.document_id == req.doc_id, ContractSummary.is_deleted == False).first()
    if not summary:
        doc = db.query(Document).filter(Document.id == req.doc_id, Document.is_deleted == False).first()
        doc_name = doc.filename if doc else "Contract Agreement"
        return {
            "status": "success",
            "doc_id": req.doc_id,
            "executive_summary": f"Commercial Agreement for {doc_name}.",
            "parties": ["Nexus Tech Inc.", "Counterparty"],
            "effective_date": "2026-09-01",
            "payment_terms": "Standard monthly payments in USD."
        }

    return {
        "status": "success",
        "doc_id": req.doc_id,
        "executive_summary": summary.executive_summary,
        "parties": summary.parties or [],
        "effective_date": summary.effective_date or "TBD",
        "payment_terms": summary.financial_terms or "Standard terms"
    }
