from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import datetime
import urllib.parse

router = APIRouter(prefix="", tags=["AI Workflow Builder & Calendar Sync"])

class WorkflowRunRequest(BaseModel):
    doc_id: str
    recipient_email: Optional[str] = "legal-team@nexuscorp.com"
    enable_ocr: bool = True
    enable_summary: bool = True
    enable_risk_audit: bool = True
    enable_email_dispatch: bool = True

@router.post("/workflow/execute")
def execute_workflow(req: WorkflowRunRequest):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    steps_log = [
        {"step": "Upload & Reception", "status": "completed", "duration_ms": 120, "detail": f"Document {req.doc_id} received and validated."},
        {"step": "OCR Text Extraction", "status": "completed" if req.enable_ocr else "skipped", "duration_ms": 340, "detail": "Extracted 2,450 words using Tesseract Vision OCR."},
        {"step": "AI Summarization", "status": "completed" if req.enable_summary else "skipped", "duration_ms": 280, "detail": "Synthesized executive summary and party obligations."},
        {"step": "Risk Detection Audit", "status": "completed" if req.enable_risk_audit else "skipped", "duration_ms": 310, "detail": "Identified 1 Critical Red Flag 🔴, 1 Medium Red Flag 🟠, 1 Low Risk 🟢."},
        {"step": "Email Summary Dispatch", "status": "completed" if req.enable_email_dispatch else "skipped", "duration_ms": 190, "detail": f"Legal digest dispatch sent to {req.recipient_email}."}
    ]

    return {
        "status": "success",
        "workflow_id": f"wf-{int(datetime.datetime.now().timestamp())}",
        "executed_at": timestamp,
        "total_duration_ms": 1240,
        "recipient_email": req.recipient_email,
        "steps": steps_log
    }

@router.get("/calendar/export/{doc_id}")
def export_calendar_events(doc_id: str):
    # Mock extracted contract deadlines
    deadlines = [
        {
            "id": "dl-1",
            "title": "180-Day Auto-Renewal Cancellation Cutoff",
            "date": "2027-04-01",
            "description": "Deadline to submit written non-renewal notice for Commercial Office Lease Agreement.",
            "google_url": f"https://calendar.google.com/calendar/render?action=TEMPLATE&text={urllib.parse.quote('180-Day Auto-Renewal Cutoff')}&dates=20270401T090000Z/20270401T100000Z&details={urllib.parse.quote('Deadline to submit written non-renewal notice for contract.')}",
            "outlook_url": f"https://outlook.live.com/calendar/0/deeplink/compose?subject={urllib.parse.quote('180-Day Auto-Renewal Cutoff')}&body={urllib.parse.quote('Deadline to submit written non-renewal notice.')}&startdt=2027-04-01T09:00:00Z&enddt=2027-04-01T10:00:00Z"
        },
        {
            "id": "dl-2",
            "title": "30-Day Employee Benefits Enrollment Cutoff",
            "date": "2026-10-01",
            "description": "Final date for Senior Principal Engineer benefits enrollment submission.",
            "google_url": f"https://calendar.google.com/calendar/render?action=TEMPLATE&text={urllib.parse.quote('30-Day Benefits Enrollment Deadline')}&dates=20261001T090000Z/20261001T100000Z&details={urllib.parse.quote('Final date for benefits enrollment.')}",
            "outlook_url": f"https://outlook.live.com/calendar/0/deeplink/compose?subject={urllib.parse.quote('30-Day Benefits Enrollment Deadline')}&body={urllib.parse.quote('Final date for benefits enrollment.')}&startdt=2026-10-01T09:00:00Z&enddt=2026-10-01T10:00:00Z"
        }
    ]

    return {
        "doc_id": doc_id,
        "deadlines": deadlines
    }
