from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="", tags=["Comparison & Admin"])

class CompareRequest(BaseModel):
    doc1_id: str
    doc2_id: str

@router.post("/compare")
def compare_contracts(req: CompareRequest):
    return {
        "doc1_name": "Base Contract A.pdf",
        "doc2_name": "Comparison Draft B.docx",
        "similarity_percentage": 42,
        "key_differences": [
            "Contract A includes 24-month non-compete clause, whereas Contract B has no non-compete.",
            "Contract A uses 30-day notice period vs Contract B 60-day notice."
        ],
        "key_similarities": [
            "Both contracts enforce strict confidentiality and non-disclosure.",
            "Both specify Delaware state law."
        ],
        "clauses": [
            {
                "title": "Confidentiality & Non-Disclosure",
                "status": "modified",
                "doc1_text": "Proprietary source code held in strict confidence perpetually.",
                "doc2_text": "Mutual confidentiality of proprietary data for a term of 5 years.",
                "analysis": "Contract A mandates perpetual confidentiality, Contract B limits to 5 years."
            },
            {
                "title": "Non-Compete Restrictions",
                "status": "removed",
                "doc1_text": "24-month worldwide restriction against competing software entities.",
                "doc2_text": "N/A (No non-compete clause present)",
                "analysis": "Non-compete present in Contract A is absent in Contract B."
            }
        ]
    }

@router.get("/admin/analytics")
def get_analytics():
    return {
        "total_users": 148,
        "total_documents": 842,
        "total_ai_requests": 12450,
        "avg_response_time_ms": 320,
        "storage_used_mb": 4850,
        "popular_topics": [
            { "topic": "Termination & Notice Periods", "count": 3240 },
            { "topic": "Non-Compete Enforceability", "count": 2890 },
            { "topic": "Payment Terms & Escalation", "count": 2150 },
            { "topic": "Indemnification & Liability Caps", "count": 1840 },
            { "topic": "Auto-Renewal Windows", "count": 1420 }
        ],
        "daily_query_trend": [
            { "date": "Jul 20", "queries": 340 },
            { "date": "Jul 21", "queries": 480 },
            { "date": "Jul 22", "queries": 620 },
            { "date": "Jul 23", "queries": 590 },
            { "date": "Jul 24", "queries": 780 },
            { "date": "Jul 25", "queries": 920 }
        ]
    }
