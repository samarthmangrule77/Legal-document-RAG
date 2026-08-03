import time
import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Chat, Message, User, Workspace, Document
from app.rag.pipeline import RAGPipeline

router = APIRouter(prefix="/chat", tags=["RAG Chat"])

class QueryRequest(BaseModel):
    query: str
    doc_ids: List[str]
    chat_id: Optional[str] = None
    beginner_mode: Optional[bool] = False

@router.get("/conversations")
def list_conversations(db: Session = Depends(get_db)):
    chats = db.query(Chat).filter(Chat.is_deleted == False).order_by(Chat.created_at.desc()).all()
    res = []
    for c in chats:
        msg_count = db.query(Message).filter(Message.chat_id == c.id, Message.is_deleted == False).count()
        res.append({
            "id": c.id,
            "title": c.title,
            "message_count": msg_count,
            "created_at": c.created_at.isoformat() if c.created_at else time.strftime("%Y-%m-%d %H:%M")
        })
    return res

@router.get("/history/{chat_id}")
def get_chat_history(chat_id: str, db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.is_deleted == False).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat conversation not found.")
    
    messages = db.query(Message).filter(Message.chat_id == chat_id, Message.is_deleted == False).order_by(Message.created_at.asc()).all()
    return {
        "chat_id": chat.id,
        "title": chat.title,
        "messages": [m.to_dict() for m in messages]
    }

@router.post("/query")
def chat_query(req: QueryRequest, db: Session = Depends(get_db)):
    # 1. Compute RAG Answer
    ai_response = RAGPipeline.answer_query(req.query, req.doc_ids, beginner_mode=req.beginner_mode or False)

    # 2. Update DOC_NAME_MAP dynamically from PostgreSQL database documents
    docs = db.query(Document).filter(Document.id.in_(req.doc_ids), Document.is_deleted == False).all()
    doc_map = {d.id: d.filename for d in docs}
    if ai_response.get("citations"):
        for cite in ai_response["citations"]:
            if cite.get("doc_id") in doc_map:
                cite["doc_name"] = doc_map[cite["doc_id"]]

    # 3. Save Chat and Messages in PostgreSQL
    ws = db.query(Workspace).first()
    ws_id = ws.id if ws else str(uuid.uuid4())
    user = db.query(User).filter(User.is_deleted == False).first()
    user_id = user.id if user else str(uuid.uuid4())

    chat_id = req.chat_id
    if chat_id:
        chat = db.query(Chat).filter(Chat.id == chat_id, Chat.is_deleted == False).first()
    else:
        chat = None

    if not chat:
        chat_id = str(uuid.uuid4())
        title_text = req.query[:50] + "..." if len(req.query) > 50 else req.query
        chat = Chat(
            id=chat_id,
            workspace_id=ws_id,
            user_id=user_id,
            title=title_text or "New Conversation"
        )
        db.add(chat)
        db.commit()

    # User Message
    user_msg = Message(
        id=str(uuid.uuid4()),
        chat_id=chat_id,
        sender="user",
        text=req.query,
        timestamp_str=time.strftime("%I:%M %p")
    )
    db.add(user_msg)

    # AI Response Message
    ai_msg = Message(
        id=str(uuid.uuid4()),
        chat_id=chat_id,
        sender="ai",
        text=ai_response.get("text", ""),
        timestamp_str=time.strftime("%I:%M %p"),
        confidence_level=ai_response.get("confidence_level", "High"),
        summary=ai_response.get("summary", ""),
        beginner_version=ai_response.get("beginner_version", ""),
        reasoning=ai_response.get("reasoning", ""),
        citations=ai_response.get("citations", []),
        related_clauses=ai_response.get("related_clauses", []),
        follow_up_questions=ai_response.get("follow_up_questions", [])
    )
    db.add(ai_msg)
    db.commit()

    ai_response["chat_id"] = chat_id
    return ai_response
