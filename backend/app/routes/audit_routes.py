import datetime
import uuid
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import AuditLog, Workspace, User

router = APIRouter(prefix="/audit", tags=["Enterprise Audit Logs"])

class LogCreateRequest(BaseModel):
    user_name: str
    action_type: str
    target_resource: str
    details: str

def _format_log(log: AuditLog) -> dict:
    ts = log.created_at.strftime("%Y-%m-%d %I:%M %p") if log.created_at else datetime.datetime.now().strftime("%Y-%m-%d %I:%M %p")
    return {
        "id": log.id,
        "timestamp": ts,
        "user_name": log.user_name,
        "user_email": log.user_email,
        "role": log.role,
        "action_type": log.action_type,
        "target_resource": log.target_resource,
        "details": log.details,
        "ip_address": log.ip_address
    }

@router.get("/logs")
def get_audit_logs(db: Session = Depends(get_db)):
    logs = db.query(AuditLog).filter(AuditLog.is_deleted == False).order_by(AuditLog.created_at.desc()).all()
    formatted = [_format_log(l) for l in logs]
    return {
        "status": "success",
        "total_count": len(formatted),
        "logs": formatted
    }

@router.post("/log")
def create_audit_log(req: LogCreateRequest, db: Session = Depends(get_db)):
    ws = db.query(Workspace).first()
    ws_id = ws.id if ws else str(uuid.uuid4())
    user = db.query(User).filter(User.is_deleted == False).first()
    user_id = user.id if user else str(uuid.uuid4())

    new_log = AuditLog(
        id=str(uuid.uuid4()),
        workspace_id=ws_id,
        user_id=user_id,
        user_name=req.user_name,
        user_email=f"{req.user_name.lower().replace(' ', '.')}@nexuscorp.com",
        role="member",
        action_type=req.action_type,
        target_resource=req.target_resource,
        details=req.details,
        ip_address="192.168.1.12"
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)

    return {"status": "success", "log": _format_log(new_log)}
