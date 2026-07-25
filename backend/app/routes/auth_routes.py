import random
import time
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from app.auth import create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication & SSO"])

# In-memory OTP store (email -> {code, expires_at})
OTP_STORE = {}

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class OTPSendRequest(BaseModel):
    email: str

class OTPVerifyRequest(BaseModel):
    email: str
    code: str

class SSOAuthRequest(BaseModel):
    provider: str  # 'google' | 'microsoft' | 'github'
    token: Optional[str] = None

@router.post("/login")
def login(req: LoginRequest):
    token = create_access_token({"sub": req.email, "role": "owner", "org_id": "org-nexus"})
    return {
        "user": {
            "id": f"u-{hash(req.email) % 10000}",
            "email": req.email,
            "name": req.email.split("@")[0].replace(".", " ").title(),
            "role": "owner",
            "active_org_id": "org-nexus",
            "active_team_id": "all"
        },
        "token": token
    }

@router.post("/register")
def register(req: RegisterRequest):
    token = create_access_token({"sub": req.email, "role": "owner", "org_id": "org-nexus"})
    return {
        "user": {
            "id": f"u-{hash(req.email) % 10000}",
            "email": req.email,
            "name": req.name,
            "role": "owner",
            "active_org_id": "org-nexus",
            "active_team_id": "all"
        },
        "token": token
    }

# 1. Email OTP Generation
@router.post("/otp/send")
def send_otp(req: OTPSendRequest):
    code = f"{random.randint(100000, 999999)}"
    OTP_STORE[req.email.lower()] = {
        "code": code,
        "expires_at": time.time() + 600  # 10 minutes
    }
    return {
        "status": "success",
        "message": f"Security 6-digit OTP sent to {req.email}",
        "demo_code": code  # Provided for instant testing
    }

# 2. Email OTP Verification
@router.post("/otp/verify")
def verify_otp(req: OTPVerifyRequest):
    email_key = req.email.lower()
    record = OTP_STORE.get(email_key)

    if not record or record["expires_at"] < time.time():
        # Fallback accept 123456 for demo
        if req.code != "123456":
            raise HTTPException(status_code=400, detail="Invalid or expired OTP security code.")
    elif record["code"] != req.code and req.code != "123456":
        raise HTTPException(status_code=400, detail="Incorrect OTP security code.")

    token = create_access_token({"sub": req.email, "role": "owner", "org_id": "org-nexus"})
    return {
        "user": {
            "id": f"u-otp-{hash(req.email) % 10000}",
            "email": req.email,
            "name": req.email.split("@")[0].replace(".", " ").title(),
            "role": "owner",
            "active_org_id": "org-nexus",
            "active_team_id": "all"
        },
        "token": token
    }

# 3. Enterprise SSO OAuth Authentication (Google, Microsoft, GitHub)
@router.post("/sso/{provider}")
def sso_authenticate(provider: str, req: SSOAuthRequest):
    provider_names = {
        "google": "Google Workspace SSO",
        "microsoft": "Microsoft Entra ID (Azure AD)",
        "github": "GitHub Enterprise"
    }

    if provider not in provider_names:
        raise HTTPException(status_code=400, detail="Unsupported Enterprise SSO Provider.")

    mock_email = f"enterprise.user@{provider}.lexirag.ai"
    token = create_access_token({"sub": mock_email, "role": "owner", "provider": provider})

    return {
        "user": {
            "id": f"sso-{provider}-{int(time.time())}",
            "email": mock_email,
            "name": f"Verified {provider.capitalize()} User",
            "role": "owner",
            "active_org_id": "org-nexus",
            "active_team_id": "all"
        },
        "token": token,
        "sso_provider": provider_names[provider]
    }
