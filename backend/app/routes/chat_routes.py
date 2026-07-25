from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from app.rag.pipeline import RAGPipeline

router = APIRouter(prefix="/chat", tags=["RAG Chat"])

class QueryRequest(BaseModel):
    query: str
    doc_ids: List[str]
    beginner_mode: Optional[bool] = False

@router.post("/query")
def chat_query(req: QueryRequest):
    return RAGPipeline.answer_query(req.query, req.doc_ids, beginner_mode=req.beginner_mode or False)
