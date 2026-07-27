from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

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

DEFAULT_SETTINGS = {
    "workspace_name": "Nexus Legal Technologies Inc.",
    "brand_logo_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60",
    "ai_llm_model": "GPT-4o (OpenAI)",
    "embedding_model": "all-MiniLM-L6-v2 (384-dim)",
    "storage_provider": "Local Vector Vault (Encrypted)",
    "primary_language": "English 🇺🇸",
    "openai_api_key": "sk-proj-************************************",
    "anthropic_api_key": "sk-ant-************************************"
}

@router.get("")
def get_settings():
    return {"status": "success", "settings": DEFAULT_SETTINGS}

@router.post("")
def update_settings(settings: WorkspaceSettings):
    DEFAULT_SETTINGS.update(settings.dict())
    return {"status": "success", "message": "Enterprise settings saved successfully.", "settings": DEFAULT_SETTINGS}
