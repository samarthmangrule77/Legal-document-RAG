import uuid
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Workspace

router = APIRouter(prefix="/settings", tags=["Enterprise Settings"])

class WorkspaceSettings(BaseModel):
    workspace_name: str
    brand_logo_url: str
    ai_llm_model: str
    embedding_model: str
    storage_provider: str
    primary_language: str
    openai_api_key: Optional[str] = ""
    anthropic_api_key: Optional[str] = ""

def _get_or_create_workspace(db: Session) -> Workspace:
    ws = db.query(Workspace).filter(Workspace.is_deleted == False).first()
    if not ws:
        ws = Workspace(
            id=str(uuid.uuid4()),
            name="Nexus Legal Technologies Inc.",
            slug="nexus-corp",
            plan="Business Pro",
            brand_logo_url="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60",
            ai_llm_model="GPT-4o (OpenAI)",
            embedding_model="all-MiniLM-L6-v2 (384-dim)",
            storage_provider="Local Vector Vault (Encrypted)",
            primary_language="English 🇺🇸",
            openai_api_key="sk-proj-************************************",
            anthropic_api_key="sk-ant-************************************"
        )
        db.add(ws)
        db.commit()
        db.refresh(ws)
    return ws

@router.get("")
def get_settings(db: Session = Depends(get_db)):
    ws = _get_or_create_workspace(db)
    settings_dict = {
        "workspace_name": ws.name,
        "brand_logo_url": ws.brand_logo_url or "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60",
        "ai_llm_model": ws.ai_llm_model,
        "embedding_model": ws.embedding_model,
        "storage_provider": ws.storage_provider,
        "primary_language": ws.primary_language,
        "openai_api_key": ws.openai_api_key or "",
        "anthropic_api_key": ws.anthropic_api_key or ""
    }
    return {"status": "success", "settings": settings_dict}

@router.post("")
def update_settings(settings: WorkspaceSettings, db: Session = Depends(get_db)):
    ws = _get_or_create_workspace(db)
    ws.name = settings.workspace_name
    ws.brand_logo_url = settings.brand_logo_url
    ws.ai_llm_model = settings.ai_llm_model
    ws.embedding_model = settings.embedding_model
    ws.storage_provider = settings.storage_provider
    ws.primary_language = settings.primary_language
    ws.openai_api_key = settings.openai_api_key
    ws.anthropic_api_key = settings.anthropic_api_key

    db.commit()
    db.refresh(ws)

    settings_dict = {
        "workspace_name": ws.name,
        "brand_logo_url": ws.brand_logo_url,
        "ai_llm_model": ws.ai_llm_model,
        "embedding_model": ws.embedding_model,
        "storage_provider": ws.storage_provider,
        "primary_language": ws.primary_language,
        "openai_api_key": ws.openai_api_key,
        "anthropic_api_key": ws.anthropic_api_key
    }
    return {"status": "success", "message": "Enterprise settings saved successfully.", "settings": settings_dict}
