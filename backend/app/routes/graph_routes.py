from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List

router = APIRouter(prefix="", tags=["Clause Graph & Version Control"])

# Mock Clause Knowledge Graph Data
MOCK_GRAPH_DATA = {
    "nodes": [
        {
            "id": "node-employer",
            "label": "Employer / Company",
            "category": "entity",
            "icon": "Building2",
            "description": "Party A: Employer providing compensation, terms, and governance.",
            "clause_ref": "Header & Parties",
            "page_number": 1,
            "risk_level": "low"
        },
        {
            "id": "node-salary",
            "label": "Base Salary & Bonus",
            "category": "compensation",
            "icon": "DollarSign",
            "description": "$185,000 USD base salary per annum paid bi-weekly + 15% bonus.",
            "clause_ref": "Clause 2.1 (Compensation)",
            "page_number": 2,
            "risk_level": "low"
        },
        {
            "id": "node-notice",
            "label": "Notice Period",
            "category": "operational",
            "icon": "Clock",
            "description": "30 days prior written notice required for voluntary resignation.",
            "clause_ref": "Clause 10.1 (Notice Window)",
            "page_number": 9,
            "risk_level": "medium"
        },
        {
            "id": "node-termination",
            "label": "Termination & Cause",
            "category": "termination",
            "icon": "AlertTriangle",
            "description": "Immediate termination permitted for gross misconduct or breach.",
            "clause_ref": "Clause 10.2 (Termination)",
            "page_number": 9,
            "risk_level": "medium"
        },
        {
            "id": "node-confidentiality",
            "label": "Confidentiality & IP",
            "category": "ip",
            "icon": "ShieldCheck",
            "description": "Strict perpetual non-disclosure of algorithms and trade secrets.",
            "clause_ref": "Clause 11.1 (Confidentiality)",
            "page_number": 10,
            "risk_level": "low"
        },
        {
            "id": "node-noncompete",
            "label": "Non-Compete Restrictions",
            "category": "restriction",
            "icon": "ShieldAlert",
            "description": "🔴 24-month worldwide post-employment non-compete restriction.",
            "clause_ref": "Clause 8.2 (Restrictive Covenants)",
            "page_number": 7,
            "risk_level": "critical"
        }
    ],
    "edges": [
        {"source": "node-employer", "target": "node-salary", "label": "Pays Compensation"},
        {"source": "node-salary", "target": "node-notice", "label": "Governs Terms"},
        {"source": "node-notice", "target": "node-termination", "label": "Triggers Notice"},
        {"source": "node-termination", "target": "node-confidentiality", "label": "Extends Protection"},
        {"source": "node-confidentiality", "target": "node-noncompete", "label": "Enforces Limits"}
    ]
}

# Mock Version History & Redline Diff Data
MOCK_VERSIONS_DATA = {
    "document_name": "Senior_Software_Engineer_Employment_Agreement.pdf",
    "active_version": "v3.0",
    "versions": [
        {
            "version": "v1.0",
            "label": "Contract V1.0 (Vendor Initial Draft)",
            "date": "2026-07-10",
            "author": "Vendor Legal Counsel",
            "risk_score": 78,
            "summary": "Initial draft containing broad 24-month worldwide non-compete and unlimited IP indemnification."
        },
        {
            "version": "v2.0",
            "label": "Contract V2.0 (Legal Redline Revision)",
            "date": "2026-07-18",
            "author": "Internal Legal Team",
            "risk_score": 45,
            "summary": "Negotiated 12-month fee cap on indemnification liability and shortened non-compete window to 12 months."
        },
        {
            "version": "v3.0",
            "label": "Contract V3.0 (Final Executed Agreement)",
            "date": "2026-07-26",
            "author": "Executive Signatory",
            "risk_score": 20,
            "summary": "Final executed agreement with 60-day notice period, 1-year local non-compete, and capped indemnification."
        }
    ],
    "diffs": [
        {
            "id": "diff-1",
            "type": "removed",
            "clause": "Clause 8.2 (Non-Compete)",
            "v1_text": "Employee shall not engage in any competing software business anywhere worldwide for 24 months post-resignation.",
            "v3_text": "Employee shall not engage in competing direct local software services for 6 months within 50 miles.",
            "analysis": "🔴 Removed 24-month worldwide restriction and replaced with reasonable 6-month local scope."
        },
        {
            "id": "diff-2",
            "type": "added",
            "clause": "Clause 12.1 (Liability Cap)",
            "v1_text": "Employee indemnifies Employer for all third-party claims without limit.",
            "v3_text": "Employer and Employee indemnification liability is capped at total fees paid in preceding 12 months.",
            "analysis": "🟢 Added mandatory 12-month monetary liability cap protecting employee from unlimited exposure."
        },
        {
            "id": "diff-3",
            "type": "modified",
            "clause": "Clause 10.1 (Notice Period)",
            "v1_text": "Either party may terminate upon giving 15 days written notice.",
            "v3_text": "Either party may terminate upon giving 30 calendar days advance written notice.",
            "analysis": "🟡 Extended notice period from 15 to 30 days allowing adequate transition time."
        }
    ]
}

@router.get("/graph/{doc_id}")
def get_clause_graph(doc_id: str):
    return MOCK_GRAPH_DATA

@router.get("/versions/{doc_id}")
def get_document_versions(doc_id: str):
    return MOCK_VERSIONS_DATA
