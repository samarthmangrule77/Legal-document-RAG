from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import datetime

router = APIRouter(prefix="/audit", tags=["Enterprise Audit Logs"])

class AuditLogItem(BaseModel):
    id: str
    timestamp: str
    user_name: str
    user_email: str
    role: str
    action_type: str  # UPLOAD | DELETE | EXPORT | GENERATE | BILLING | AUTH
    target_resource: str
    details: str
    ip_address: str

# Initial mock audit trail events
INITIAL_AUDIT_LOGS = [
    {
        "id": "audit-101",
        "timestamp": "2026-07-27 11:50 AM",
        "user_name": "Alex Rivera",
        "user_email": "alex.rivera@nexuscorp.com",
        "role": "owner",
        "action_type": "BILLING",
        "target_resource": "Subscription Plan",
        "details": "Upgraded workspace subscription to Pro Plan ($29/mo) via Stripe.",
        "ip_address": "192.168.1.45"
    },
    {
        "id": "audit-102",
        "timestamp": "2026-07-27 11:30 AM",
        "user_name": "Samarth Mangrule",
        "user_email": "samarth@nexuscorp.com",
        "role": "admin",
        "action_type": "GENERATE",
        "target_resource": "Employment Agreement",
        "details": "Synthesized and indexed Employment Agreement for Sarah Connor via AI Generator.",
        "ip_address": "192.168.1.12"
    },
    {
        "id": "audit-103",
        "timestamp": "2026-07-27 11:15 AM",
        "user_name": "Samarth Mangrule",
        "user_email": "samarth@nexuscorp.com",
        "role": "admin",
        "action_type": "EXPORT",
        "target_resource": "Legal Risk Summary PDF",
        "details": "User exported PDF legal risk summary report for Senior_Software_Engineer_Agreement.pdf.",
        "ip_address": "192.168.1.12"
    },
    {
        "id": "audit-104",
        "timestamp": "2026-07-27 10:45 AM",
        "user_name": "Alex Rivera (Admin)",
        "user_email": "alex.rivera@nexuscorp.com",
        "role": "owner",
        "action_type": "DELETE",
        "target_resource": "draft_contract_v1.pdf",
        "details": "Admin deleted draft_contract_v1.pdf from Legal Workspace.",
        "ip_address": "192.168.1.45"
    },
    {
        "id": "audit-105",
        "timestamp": "2026-07-27 10:20 AM",
        "user_name": "Samarth Mangrule",
        "user_email": "samarth@nexuscorp.com",
        "role": "admin",
        "action_type": "UPLOAD",
        "target_resource": "Senior_Software_Engineer_Agreement.pdf",
        "details": "Samarth uploaded Senior_Software_Engineer_Agreement.pdf (2.4 MB) to Legal Workspace.",
        "ip_address": "192.168.1.12"
    }
]

@router.get("/logs")
def get_audit_logs():
    return {
        "status": "success",
        "total_count": len(INITIAL_AUDIT_LOGS),
        "logs": INITIAL_AUDIT_LOGS
    }

class LogCreateRequest(BaseModel):
    user_name: str
    action_type: str
    target_resource: str
    details: str

@router.post("/log")
def create_audit_log(req: LogCreateRequest):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %I:%M %p")
    new_log = {
        "id": f"audit-{int(datetime.datetime.now().timestamp())}",
        "timestamp": timestamp,
        "user_name": req.user_name,
        "user_email": f"{req.user_name.lower().replace(' ', '.')}@nexuscorp.com",
        "role": "member",
        "action_type": req.action_type,
        "target_resource": req.target_resource,
        "details": req.details,
        "ip_address": "192.168.1.12"
    }
    INITIAL_AUDIT_LOGS.insert(0, new_log)
    return {"status": "success", "log": new_log}
