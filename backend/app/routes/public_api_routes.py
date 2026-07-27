from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import datetime

router = APIRouter(prefix="/v1/public", tags=["Developer Public REST API"])

class PublicQueryRequest(BaseModel):
    query: str
    doc_ids: Optional[List[str]] = ["doc-001"]

class PublicRiskRequest(BaseModel):
    doc_id: str

class PublicSummaryRequest(BaseModel):
    doc_id: str

@router.post("/upload")
def public_upload_contract(api_key: Optional[str] = Header(None, alias="X-API-Key")):
    return {
        "status": "success",
        "doc_id": f"doc-pub-{int(datetime.datetime.now().timestamp())}",
        "filename": "Enterprise_Vendor_Agreement.pdf",
        "file_size": "3.2 MB",
        "chunk_count": 18,
        "indexed": True,
        "timestamp": datetime.datetime.now().isoformat()
    }

@router.post("/query")
def public_query_rag(req: PublicQueryRequest, api_key: Optional[str] = Header(None, alias="X-API-Key")):
    return {
        "status": "success",
        "query": req.query,
        "summary": f"Public REST API response synthesized for query: '{req.query}'.",
        "answer": f"According to Clause 10.1 of the agreement, provisions are binding under governing jurisdiction.",
        "citations": [
            {
                "doc_name": "Senior_Software_Engineer_Agreement.pdf",
                "page_number": 9,
                "clause_number": "Clause 10.1",
                "snippet": "Either party may terminate upon giving 30 calendar days advance written notice.",
                "confidence": 0.96
            }
        ]
    }

@router.post("/risk")
def public_risk_audit(req: PublicRiskRequest, api_key: Optional[str] = Header(None, alias="X-API-Key")):
    return {
        "status": "success",
        "doc_id": req.doc_id,
        "risk_score": 68,
        "critical_red_flags_count": 1,
        "medium_red_flags_count": 1,
        "low_risk_count": 1,
        "red_flags": [
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
    }

@router.post("/summary")
def public_contract_summary(req: PublicSummaryRequest, api_key: Optional[str] = Header(None, alias="X-API-Key")):
    return {
        "status": "success",
        "doc_id": req.doc_id,
        "executive_summary": "Commercial Agreement between Nexus Tech Inc. (Employer) and Alex Rivera (Employee).",
        "parties": ["Nexus Tech Inc.", "Alex Rivera"],
        "effective_date": "2026-09-01",
        "payment_terms": "$185,000 USD base salary per annum paid bi-weekly."
    }
