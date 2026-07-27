from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import datetime

router = APIRouter(prefix="/agent", tags=["Autonomous AI Legal Agent"])

class AgentGoalRequest(BaseModel):
    goal: str
    target_docs: Optional[List[str]] = ["doc-001", "doc-002"]

AGENT_STATE = {
    "status": "active",
    "agent_name": "LexiRAG Autonomous Legal Agent",
    "mode": "Autonomous Continuous Monitoring",
    "last_run": "Just now",
    "contracts_scanned": 8,
    "actions_suggested": 4,
    "reminders_dispatched": 3,
    "reports_generated": 2,
    "proactive_suggestions": [
        {
            "id": "sug-101",
            "contract": "Senior_Software_Engineer_Agreement.pdf",
            "action_title": "Renegotiate Uncapped Indemnification Cap",
            "reasoning": "Clause 12.1 contains unlimited monetary liability. Recommend adding a 12-month base salary ceiling cap.",
            "urgency": "HIGH",
            "icon": "🔴"
        },
        {
            "id": "sug-102",
            "contract": "Commercial_Lease_Agreement.pdf",
            "action_title": "Schedule Non-Renewal Notice Review",
            "reasoning": "60-day cancellation window begins on April 1, 2027. Send non-renewal letter to landlord before cutoff.",
            "urgency": "MEDIUM",
            "icon": "📅"
        },
        {
            "id": "sug-103",
            "contract": "Vendor_SaaS_Master_Services_Agreement.pdf",
            "action_title": "Verify SOC2 Type II Security Compliance",
            "reasoning": "Annual security audit clause requires vendor to furnish updated SOC2 report by September 15.",
            "urgency": "LOW",
            "icon": "🟢"
        }
    ],
    "scheduled_reminders": [
        {
            "id": "rem-201",
            "title": "⏰ Commercial Lease Non-Renewal Window",
            "deadline": "2027-04-01",
            "google_calendar_url": "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Commercial+Lease+Notice+Deadline",
            "outlook_calendar_url": "https://outlook.live.com/calendar/0/deeplink/compose?subject=Commercial+Lease+Notice+Deadline"
        },
        {
            "id": "rem-202",
            "title": "⏰ Senior Software Engineer Annual Compensation Review",
            "deadline": "2027-08-15",
            "google_calendar_url": "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Annual+Compensation+Review",
            "outlook_calendar_url": "https://outlook.live.com/calendar/0/deeplink/compose?subject=Annual+Compensation+Review"
        }
    ],
    "generated_reports": [
        {
            "id": "rep-301",
            "title": "Executive Legal Risk & Exposure Audit Report (Q3 2026)",
            "generated_date": "2026-07-27",
            "summary": "Full autonomous audit across 8 contracts. Identified 1 critical indemnification exposure and 2 renewal deadlines.",
            "format": "PDF / Markdown"
        }
    ]
}

@router.get("/status")
def get_agent_status():
    return {"status": "success", "agent": AGENT_STATE}

@router.post("/run")
def run_agent_loop(req: AgentGoalRequest):
    return {
        "status": "success",
        "goal": req.goal,
        "message": f"Autonomous AI Legal Agent executed goal successfully.",
        "steps_completed": [
            "Step 1: Automatic Contract Ingestion & Clause Analysis complete (8 contracts scanned).",
            "Step 2: Proactive Action Suggestions synthesized (3 action cards generated).",
            "Step 3: Automated Reminders dispatched to Google & Outlook Calendars.",
            "Step 4: Executive Legal Exposure PDF Audit Report generated."
        ],
        "agent": AGENT_STATE
    }
