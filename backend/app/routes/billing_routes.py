import time
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/billing", tags=["Billing & SaaS Subscriptions"])

# In-memory subscription store for demonstration & SaaS persistence
CURRENT_SUBSCRIPTION = {
    "plan_id": "free",  # 'free' | 'pro' | 'enterprise'
    "plan_name": "Free Plan",
    "pdf_limit": 5,     # 5 PDFs for free tier, -1 for unlimited
    "current_pdf_count": 3,
    "status": "active",
    "billing_cycle": "monthly",
    "price_per_month": 0,
    "renews_at": "2026-08-27",
    "stripe_customer_id": "cus_lexi99201",
    "stripe_subscription_id": None
}

INVOICE_HISTORY = [
    {
        "id": "inv_1092",
        "date": "2026-07-01",
        "amount": "$0.00",
        "status": "Paid",
        "plan": "Free Plan",
        "pdf_url": "#"
    }
]

class CheckoutSessionRequest(BaseModel):
    target_plan: str  # 'pro' | 'enterprise'
    billing_cycle: Optional[str] = "monthly"  # 'monthly' | 'annual'

class CancelSubscriptionRequest(BaseModel):
    reason: Optional[str] = "No longer needed"

@router.get("/subscription")
def get_subscription_details():
    from app.routes.doc_routes import DB_DOCS
    CURRENT_SUBSCRIPTION["current_pdf_count"] = len(DB_DOCS)
    
    return {
        "subscription": CURRENT_SUBSCRIPTION,
        "invoices": INVOICE_HISTORY,
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
                "pdf_limit": -1,  # Unlimited
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
                "pdf_limit": -1,  # Unlimited
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
def create_checkout_session(req: CheckoutSessionRequest):
    if req.target_plan not in ["pro", "enterprise"]:
        raise HTTPException(status_code=400, detail="Invalid subscription plan selected.")

    # Simulated Stripe Checkout Session URL & payload
    session_id = f"cs_test_{int(time.time())}"
    mock_stripe_checkout_url = f"https://checkout.stripe.com/pay/{session_id}"

    # Auto-upgrade in demo mode so user sees instant plan upgrade
    if req.target_plan == "pro":
        CURRENT_SUBSCRIPTION["plan_id"] = "pro"
        CURRENT_SUBSCRIPTION["plan_name"] = "Pro Plan"
        CURRENT_SUBSCRIPTION["pdf_limit"] = -1
        CURRENT_SUBSCRIPTION["price_per_month"] = 29 if req.billing_cycle == "monthly" else 24
        CURRENT_SUBSCRIPTION["stripe_subscription_id"] = f"sub_pro_{int(time.time())}"
        
        INVOICE_HISTORY.insert(0, {
            "id": f"inv_{int(time.time()) % 10000}",
            "date": time.strftime("%Y-%m-%d"),
            "amount": "$29.00" if req.billing_cycle == "monthly" else "$290.00",
            "status": "Paid",
            "plan": "Pro Plan",
            "pdf_url": "#"
        })
    elif req.target_plan == "enterprise":
        CURRENT_SUBSCRIPTION["plan_id"] = "enterprise"
        CURRENT_SUBSCRIPTION["plan_name"] = "Enterprise Plan"
        CURRENT_SUBSCRIPTION["pdf_limit"] = -1
        CURRENT_SUBSCRIPTION["price_per_month"] = 199 if req.billing_cycle == "monthly" else 165
        CURRENT_SUBSCRIPTION["stripe_subscription_id"] = f"sub_ent_{int(time.time())}"

        INVOICE_HISTORY.insert(0, {
            "id": f"inv_{int(time.time()) % 10000}",
            "date": time.strftime("%Y-%m-%d"),
            "amount": "$199.00" if req.billing_cycle == "monthly" else "$1,990.00",
            "status": "Paid",
            "plan": "Enterprise Plan",
            "pdf_url": "#"
        })

    return {
        "status": "success",
        "checkout_url": mock_stripe_checkout_url,
        "session_id": session_id,
        "message": f"Successfully upgraded to {CURRENT_SUBSCRIPTION['plan_name']}!",
        "updated_subscription": CURRENT_SUBSCRIPTION
    }

@router.post("/cancel-subscription")
def cancel_subscription(req: CancelSubscriptionRequest):
    CURRENT_SUBSCRIPTION["plan_id"] = "free"
    CURRENT_SUBSCRIPTION["plan_name"] = "Free Plan"
    CURRENT_SUBSCRIPTION["pdf_limit"] = 5
    CURRENT_SUBSCRIPTION["price_per_month"] = 0
    CURRENT_SUBSCRIPTION["stripe_subscription_id"] = None

    return {
        "status": "success",
        "message": "Subscription cancelled. Downgraded to Free Plan.",
        "subscription": CURRENT_SUBSCRIPTION
    }

@router.post("/webhook")
async def stripe_webhook(request: Request):
    # Endpoint for listening to real Stripe events (e.g. customer.subscription.updated)
    try:
        body = await request.body()
        return {"status": "received", "event_type": "stripe_webhook_received"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
