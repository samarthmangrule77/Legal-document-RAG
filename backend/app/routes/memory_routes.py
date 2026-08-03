import uuid
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Workspace

router = APIRouter(prefix="/memory", tags=["AI Memory & Preferences"])

class MemoryPreferences(BaseModel):
    company_policy_rules: str
    preferred_language: str
    explanation_style: str
    tone: str

def _get_or_create_workspace(db: Session) -> Workspace:
    ws = db.query(Workspace).filter(Workspace.is_deleted == False).first()
    if not ws:
        ws = Workspace(
            id=str(uuid.uuid4()),
            name="Nexus Legal Technologies Inc.",
            slug="nexus-corp",
            plan="Business Pro",
            company_policy_rules="All indemnification clauses must be capped at 12 months total fees paid. Non-compete covenants must be limited to 6 months local territory. Notice period minimum is 30 calendar days.",
            preferred_language="English 🇺🇸",
            explanation_style="Executive TL;DR",
            tone="Professional & Direct"
        )
        db.add(ws)
        db.commit()
        db.refresh(ws)
    return ws

@router.get("/preferences")
def get_memory_preferences(db: Session = Depends(get_db)):
    ws = _get_or_create_workspace(db)
    prefs = {
        "company_policy_rules": ws.company_policy_rules or "",
        "preferred_language": ws.preferred_language or "English 🇺🇸",
        "explanation_style": ws.explanation_style or "Executive TL;DR",
        "tone": ws.tone or "Professional & Direct"
    }
    return {
        "status": "success",
        "preferences": prefs
    }

@router.post("/preferences")
def update_memory_preferences(prefs: MemoryPreferences, db: Session = Depends(get_db)):
    ws = _get_or_create_workspace(db)
    ws.company_policy_rules = prefs.company_policy_rules
    ws.preferred_language = prefs.preferred_language
    ws.explanation_style = prefs.explanation_style
    ws.tone = prefs.tone

    db.commit()
    db.refresh(ws)

    updated_prefs = {
        "company_policy_rules": ws.company_policy_rules,
        "preferred_language": ws.preferred_language,
        "explanation_style": ws.explanation_style,
        "tone": ws.tone
    }
    return {
        "status": "success",
        "message": "AI Memory preferences saved successfully.",
        "preferences": updated_prefs
    }
