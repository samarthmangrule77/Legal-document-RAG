import time
import uuid
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Subscription, Invoice, Workspace, Document

router = APIRouter(prefix="/billing", tags=["Billing & SaaS Subscriptions"])

class CheckoutSessionRequest(BaseModel):
    target_plan: str  # 'pro' | 'enterprise'
    billing_cycle: Optional[str] = "monthly"  # 'monthly' | 'annual'

class CancelSubscriptionRequest(BaseModel):
    reason: Optional[str] = "No longer needed"

def _get_or_create_sub(db: Session) -> Subscription:
    sub = db.query(Subscription).filter(Subscription.is_deleted == False).first()
    if not sub:
        ws = db.query(Workspace).first()
        ws_id = ws.id if ws else str(uuid.uuid4())
        sub = Subscription(
            id=str(uuid.uuid4()),
            workspace_id=ws_id,
            plan_id="free",
            plan_name="Free Plan",
            pdf_limit=5,
            current_pdf_count=0,
            status="active",
            billing_cycle="monthly",
            price_per_month=0.0,
            renews_at="2026-08-27",
            stripe_customer_id="cus_lexi99201"
        )
        db.add(sub)
        db.commit()
        db.refresh(sub)
    return sub

@router.get("/subscription")
def get_subscription_details(db: Session = Depends(get_db)):
    sub = _get_or_create_sub(db)
    doc_count = db.query(Document).filter(Document.is_deleted == False).count()
    sub.current_pdf_count = doc_count
    db.commit()

    invoices = db.query(Invoice).filter(Invoice.subscription_id == sub.id, Invoice.is_deleted == False).order_by(Invoice.created_at.desc()).all()

    inv_list = []
    for inv in invoices:
        inv_list.append({
            "id": inv.invoice_number,
            "date": inv.date_str,
            "amount": inv.amount_str,
            "status": inv.status,
            "plan": inv.plan_name,
            "pdf_url": inv.pdf_url
        })

    sub_dict = {
        "plan_id": sub.plan_id,
        "plan_name": sub.plan_name,
        "pdf_limit": sub.pdf_limit,
        "current_pdf_count": sub.current_pdf_count,
        "status": sub.status,
        "billing_cycle": sub.billing_cycle,
        "price_per_month": sub.price_per_month,
        "renews_at": sub.renews_at,
        "stripe_customer_id": sub.stripe_customer_id,
        "stripe_subscription_id": getattr(sub, "stripe_subscription_id", None)
    }

    return {
        "subscription": sub_dict,
        "invoices": inv_list,
        "plans": [
            {
                "id": "free",
                "name": "Free Plan",
                "price_monthly": 0,
                "price_annual": 0,
                "pdf_limit": 5,
                "features": [
                    "Up to 5 PDF document uploads",
                    "Standard vector search & RAG",
                    "Single user workspace",
                    "Basic risk detection",
                    "Community support"
                ]
            },
            {
                "id": "pro",
                "name": "Pro Plan",
                "price_monthly": 29,
                "price_annual": 290,
                "pdf_limit": -1,
                "features": [
                    "Unlimited PDF & DOCX uploads",
                    "Priority OCR for scanned contracts",
                    "Side-by-side contract comparison",
                    "AI timeline & deadline extractor",
                    "Export analysis to PDF/Word",
                    "Up to 10 team members",
                    "Email & chat support"
                ]
            },
            {
                "id": "enterprise",
                "name": "Enterprise Plan",
                "price_monthly": 199,
                "price_annual": 1990,
                "pdf_limit": -1,
                "features": [
                    "Everything in Pro Plan",
                    "Dedicated vector database instance",
                    "Enterprise SSO (Google, Azure AD, Okta)",
                    "Custom SLA & audit logs",
                    "Unlimited team members & roles",
                    "Dedicated account manager & onboarding"
                ]
            }
        ]
    }

@router.post("/create-checkout-session")
def create_checkout_session(req: CheckoutSessionRequest, db: Session = Depends(get_db)):
    if req.target_plan not in ["pro", "enterprise"]:
        raise HTTPException(status_code=400, detail="Invalid subscription plan selected.")

    sub = _get_or_create_sub(db)

    session_id = f"cs_test_{int(time.time())}"
    mock_stripe_checkout_url = f"https://checkout.stripe.com/pay/{session_id}"

    if req.target_plan == "pro":
        sub.plan_id = "pro"
        sub.plan_name = "Pro Plan"
        sub.pdf_limit = -1
        sub.price_per_month = 29.0 if req.billing_cycle == "monthly" else 24.0
        sub.stripe_subscription_id = f"sub_pro_{int(time.time())}"
        
        inv = Invoice(
            id=str(uuid.uuid4()),
            subscription_id=sub.id,
            invoice_number=f"inv_{int(time.time()) % 10000}",
            date_str=time.strftime("%Y-%m-%d"),
            amount_str="$29.00" if req.billing_cycle == "monthly" else "$290.00",
            status="Paid",
            plan_name="Pro Plan",
            pdf_url="#"
        )
        db.add(inv)
    elif req.target_plan == "enterprise":
        sub.plan_id = "enterprise"
        sub.plan_name = "Enterprise Plan"
        sub.pdf_limit = -1
        sub.price_per_month = 199.0 if req.billing_cycle == "monthly" else 165.0
        sub.stripe_subscription_id = f"sub_ent_{int(time.time())}"

        inv = Invoice(
            id=str(uuid.uuid4()),
            subscription_id=sub.id,
            invoice_number=f"inv_{int(time.time()) % 10000}",
            date_str=time.strftime("%Y-%m-%d"),
            amount_str="$199.00" if req.billing_cycle == "monthly" else "$1,990.00",
            status="Paid",
            plan_name="Enterprise Plan",
            pdf_url="#"
        )
        db.add(inv)

    db.commit()
    db.refresh(sub)

    sub_dict = {
        "plan_id": sub.plan_id,
        "plan_name": sub.plan_name,
        "pdf_limit": sub.pdf_limit,
        "current_pdf_count": sub.current_pdf_count,
        "status": sub.status,
        "billing_cycle": sub.billing_cycle,
        "price_per_month": sub.price_per_month,
        "renews_at": sub.renews_at,
        "stripe_customer_id": sub.stripe_customer_id,
        "stripe_subscription_id": sub.stripe_subscription_id
    }

    return {
        "status": "success",
        "checkout_url": mock_stripe_checkout_url,
        "session_id": session_id,
        "message": f"Successfully upgraded to {sub.plan_name}!",
        "updated_subscription": sub_dict
    }

@router.post("/cancel-subscription")
def cancel_subscription(req: CancelSubscriptionRequest, db: Session = Depends(get_db)):
    sub = _get_or_create_sub(db)
    sub.plan_id = "free"
    sub.plan_name = "Free Plan"
    sub.pdf_limit = 5
    sub.price_per_month = 0.0
    sub.stripe_subscription_id = None
    db.commit()

    sub_dict = {
        "plan_id": sub.plan_id,
        "plan_name": sub.plan_name,
        "pdf_limit": sub.pdf_limit,
        "current_pdf_count": sub.current_pdf_count,
        "status": sub.status,
        "billing_cycle": sub.billing_cycle,
        "price_per_month": sub.price_per_month,
        "renews_at": sub.renews_at,
        "stripe_customer_id": sub.stripe_customer_id,
        "stripe_subscription_id": sub.stripe_subscription_id
    }

    return {
        "status": "success",
        "message": "Subscription cancelled. Downgraded to Free Plan.",
        "subscription": sub_dict
    }

@router.post("/webhook")
async def stripe_webhook(request: Request):
    try:
        body = await request.body()
        return {"status": "received", "event_type": "stripe_webhook_received"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
