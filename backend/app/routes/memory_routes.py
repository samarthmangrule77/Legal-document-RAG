from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/memory", tags=["AI Memory & Preferences"])

class MemoryPreferences(BaseModel):
    company_policy_rules: str
    preferred_language: str
    explanation_style: str
    tone: str

DEFAULT_PREFERENCES = {
    "company_policy_rules": "All indemnification clauses must be capped at 12 months total fees paid. Non-compete covenants must be limited to 6 months local territory. Notice period minimum is 30 calendar days.",
    "preferred_language": "English 🇺🇸",
    "explanation_style": "Executive TL;DR",
    "tone": "Professional & Direct"
}

@router.get("/preferences")
def get_memory_preferences():
    return {
        "status": "success",
        "preferences": DEFAULT_PREFERENCES
    }

@router.post("/preferences")
def update_memory_preferences(prefs: MemoryPreferences):
    DEFAULT_PREFERENCES["company_policy_rules"] = prefs.company_policy_rules
    DEFAULT_PREFERENCES["preferred_language"] = prefs.preferred_language
    DEFAULT_PREFERENCES["explanation_style"] = prefs.explanation_style
    DEFAULT_PREFERENCES["tone"] = prefs.tone
    return {
        "status": "success",
        "message": "AI Memory preferences saved successfully.",
        "preferences": DEFAULT_PREFERENCES
    }
