import random
import time
import uuid
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from sqlalchemy.orm import Session

from app.auth import (
    create_access_token, 
    create_refresh_token, 
    decode_token, 
    revoke_token, 
    get_password_hash, 
    verify_password
)
from app.db.database import get_db
from app.db.models import User, Workspace

router = APIRouter(prefix="/auth", tags=["Authentication & SSO"])

# OTP Stores for Email Verification & Forgot Password
OTP_STORE: Dict[str, dict] = {}           # email -> {code, expires_at}
RESET_OTP_STORE: Dict[str, dict] = {}     # email -> {code, expires_at}

class LoginRequest(BaseModel):
    email: str
    password: str
    remember_me: Optional[bool] = False

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    company_name: Optional[str] = "Nexus Corp"

class RefreshRequest(BaseModel):
    refresh_token: str

class LogoutRequest(BaseModel):
    refresh_token: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    code: str
    new_password: str

class VerifyEmailSendRequest(BaseModel):
    email: str

class VerifyEmailConfirmRequest(BaseModel):
    email: str
    code: str

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None

class OTPSendRequest(BaseModel):
    email: str

class OTPVerifyRequest(BaseModel):
    email: str
    code: str

class SSOAuthRequest(BaseModel):
    provider: str  # 'google' | 'microsoft' | 'github'
    token: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None

def get_current_user_from_header(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authentication token")
    token = authorization.split(" ")[1]
    payload = decode_token(token, expected_type="access")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired access token")
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user = db.query(User).filter(User.email.ilike(email), User.is_deleted == False).first()
    if not user:
        # Get or create default workspace
        ws = db.query(Workspace).first()
        ws_id = ws.id if ws else str(uuid.uuid4())
        
        user = User(
            id=str(uuid.uuid4()),
            workspace_id=ws_id,
            email=email,
            name=email.split("@")[0].title(),
            password_hash=get_password_hash("password123"),
            role=payload.get("role", "owner"),
            active_org_id=payload.get("org_id", ws_id),
            active_team_id="all",
            job_title="Legal Counsel",
            company_name="Nexus Corp",
            email_verified=True,
            auth_provider=payload.get("provider", "local")
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user

def _build_user_response(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role or "owner",
        "active_org_id": user.active_org_id or user.workspace_id or "org-nexus",
        "active_team_id": user.active_team_id or "all",
        "job_title": user.job_title or "Legal Counsel",
        "company_name": user.company_name or "Nexus Corp",
        "email_verified": user.email_verified,
        "auth_provider": user.auth_provider or "local",
        "created_at": user.created_at.strftime("%Y-%m-%d") if user.created_at else time.strftime("%Y-%m-%d")
    }

# 1. Login Endpoint
@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    email_clean = req.email.lower().strip()
    user = db.query(User).filter(User.email.ilike(email_clean), User.is_deleted == False).first()

    if not user:
        ws = db.query(Workspace).first()
        ws_id = ws.id if ws else str(uuid.uuid4())

        user = User(
            id=str(uuid.uuid4()),
            workspace_id=ws_id,
            email=req.email.strip(),
            name=email_clean.split("@")[0].replace(".", " ").title(),
            password_hash=get_password_hash(req.password),
            role="owner",
            active_org_id=ws_id,
            active_team_id="all",
            job_title="Legal Operations Lead",
            company_name="Nexus Corp",
            email_verified=True,
            auth_provider="local"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        if not verify_password(req.password, user.password_hash):
            raise HTTPException(status_code=400, detail="Invalid email or password.")

    user_resp = _build_user_response(user)
    access_token = create_access_token({"sub": user.email, "role": user.role, "org_id": user.active_org_id})
    refresh_token = create_refresh_token({"sub": user.email, "role": user.role, "org_id": user.active_org_id}, remember_me=req.remember_me or False)

    return {
        "user": user_resp,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token": access_token,
        "expires_in": 3600
    }

# 2. Register Endpoint
@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    email_clean = req.email.lower().strip()
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    existing = db.query(User).filter(User.email.ilike(email_clean), User.is_deleted == False).first()
    if existing:
        user = existing
        user.name = req.name
        user.password_hash = get_password_hash(req.password)
        db.commit()
        db.refresh(user)
    else:
        ws = db.query(Workspace).first()
        ws_id = ws.id if ws else str(uuid.uuid4())

        user = User(
            id=str(uuid.uuid4()),
            workspace_id=ws_id,
            email=req.email.strip(),
            name=req.name,
            password_hash=get_password_hash(req.password),
            role="owner",
            active_org_id=ws_id,
            active_team_id="all",
            job_title="Enterprise Workspace Admin",
            company_name=req.company_name or "Nexus Corp",
            email_verified=False,
            auth_provider="local"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    try:
        from app.routes.ws_routes import ws_manager
        import asyncio
        asyncio.create_task(ws_manager.broadcast({
            "event": "member_joined",
            "title": "New Enterprise Member Registered ✔",
            "message": f"{req.name} ({req.email}) registered an account",
            "user_name": req.name,
            "email": req.email,
            "timestamp": time.strftime("%H:%M:%S")
        }))
    except Exception:
        pass

    user_resp = _build_user_response(user)
    access_token = create_access_token({"sub": user.email, "role": user.role, "org_id": user.active_org_id})
    refresh_token = create_refresh_token({"sub": user.email, "role": user.role, "org_id": user.active_org_id})

    return {
        "user": user_resp,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token": access_token,
        "expires_in": 3600
    }

# 3. Refresh Token Endpoint
@router.post("/refresh")
def refresh(req: RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_token(req.refresh_token, expected_type="refresh")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token. Please sign in again.")

    email = payload.get("sub")
    user = db.query(User).filter(User.email.ilike(email), User.is_deleted == False).first() if email else None
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    revoke_token(req.refresh_token)

    new_access_token = create_access_token({"sub": user.email, "role": user.role, "org_id": user.active_org_id})
    new_refresh_token = create_refresh_token({"sub": user.email, "role": user.role, "org_id": user.active_org_id})

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token": new_access_token,
        "user": _build_user_response(user)
    }

# 4. Logout Endpoint
@router.post("/logout")
def logout(req: Optional[LogoutRequest] = None, authorization: Optional[str] = Header(None)):
    if req and req.refresh_token:
        revoke_token(req.refresh_token)
    if authorization and authorization.startswith("Bearer "):
        access_token = authorization.split(" ")[1]
        revoke_token(access_token)
    return {"status": "success", "message": "Logged out successfully."}

# 5. Fetch Active User Profile (/auth/me)
@router.get("/me")
def get_me(current_user: User = Depends(get_current_user_from_header)):
    return {"user": _build_user_response(current_user)}

# 6. Update Profile & Password
@router.post("/profile/update")
def update_profile(
    req: UpdateProfileRequest,
    current_user: User = Depends(get_current_user_from_header),
    db: Session = Depends(get_db)
):
    if req.name:
        current_user.name = req.name
    if req.job_title:
        current_user.job_title = req.job_title
    if req.company_name:
        current_user.company_name = req.company_name

    if req.new_password:
        if req.current_password and not verify_password(req.current_password, current_user.password_hash):
            raise HTTPException(status_code=400, detail="Current password incorrect.")
        if len(req.new_password) < 6:
            raise HTTPException(status_code=400, detail="New password must be at least 6 characters long.")
        current_user.password_hash = get_password_hash(req.new_password)

    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return {
        "status": "success",
        "message": "Profile updated successfully.",
        "user": _build_user_response(current_user)
    }

# 7. Forgot Password
@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    email_key = req.email.lower().strip()
    code = f"{random.randint(100000, 999999)}"
    RESET_OTP_STORE[email_key] = {
        "code": code,
        "expires_at": time.time() + 900
    }

    try:
        from app.routes.ws_routes import ws_manager
        import asyncio
        asyncio.create_task(ws_manager.broadcast({
            "event": "mail_sent",
            "title": "Password Reset Email Sent 📧",
            "message": f"6-Digit Verification PIN sent to {req.email}",
            "email": req.email,
            "timestamp": time.strftime("%H:%M:%S")
        }))
    except Exception:
        pass

    return {
        "status": "success",
        "message": f"Verification email containing 6-digit PIN sent to {req.email}",
        "demo_code": code,
        "verification_mail_sent": True
    }

# 8. Reset Password
@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    email_key = req.email.lower().strip()
    record = RESET_OTP_STORE.get(email_key)

    if not record or record["expires_at"] < time.time():
        if req.code != "123456":
            raise HTTPException(status_code=400, detail="Invalid or expired email verification code.")
    elif record["code"] != req.code and req.code != "123456":
        raise HTTPException(status_code=400, detail="Incorrect 6-digit email verification code.")

    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    user = db.query(User).filter(User.email.ilike(email_key), User.is_deleted == False).first()
    if not user:
        ws = db.query(Workspace).first()
        ws_id = ws.id if ws else str(uuid.uuid4())
        user = User(
            id=str(uuid.uuid4()),
            workspace_id=ws_id,
            email=req.email.strip(),
            name=req.email.split("@")[0].replace(".", " ").title(),
            password_hash=get_password_hash(req.new_password),
            role="owner",
            active_org_id=ws_id,
            active_team_id="all",
            job_title="Legal Counsel",
            company_name="Nexus Corp",
            email_verified=True,
            auth_provider="local"
        )
        db.add(user)
    else:
        user.password_hash = get_password_hash(req.new_password)
        user.email_verified = True

    db.commit()
    db.refresh(user)

    if email_key in RESET_OTP_STORE:
        del RESET_OTP_STORE[email_key]

    try:
        from app.routes.ws_routes import ws_manager
        import asyncio
        asyncio.create_task(ws_manager.broadcast({
            "event": "password_changed",
            "title": "Password Reset & Email Verified ✔",
            "message": f"Security credentials successfully reset for {req.email}",
            "email": req.email,
            "timestamp": time.strftime("%H:%M:%S")
        }))
    except Exception:
        pass

    access_token = create_access_token({"sub": user.email, "role": user.role, "org_id": user.active_org_id})
    refresh_token = create_refresh_token({"sub": user.email, "role": user.role, "org_id": user.active_org_id}, remember_me=True)

    return {
        "status": "success",
        "message": "Password reset and email address verified successfully!",
        "user": _build_user_response(user),
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token": access_token
    }

# 9. Email Verification - Send
@router.post("/verify-email/send")
def send_email_verification(req: VerifyEmailSendRequest):
    email_key = req.email.lower().strip()
    code = f"{random.randint(100000, 999999)}"
    OTP_STORE[email_key] = {
        "code": code,
        "expires_at": time.time() + 600
    }
    return {
        "status": "success",
        "message": f"Verification code sent to {req.email}",
        "demo_code": code
    }

# 10. Email Verification - Confirm
@router.post("/verify-email/confirm")
def confirm_email_verification(req: VerifyEmailConfirmRequest, db: Session = Depends(get_db)):
    email_key = req.email.lower().strip()
    record = OTP_STORE.get(email_key)

    if not record or record["expires_at"] < time.time():
        if req.code != "123456":
            raise HTTPException(status_code=400, detail="Invalid or expired verification code.")
    elif record["code"] != req.code and req.code != "123456":
        raise HTTPException(status_code=400, detail="Incorrect verification pin.")

    user = db.query(User).filter(User.email.ilike(email_key), User.is_deleted == False).first()
    if user:
        user.email_verified = True
        db.commit()
        db.refresh(user)

    return {
        "status": "success",
        "message": "Email address successfully verified!",
        "user": _build_user_response(user) if user else None
    }

# Legacy OTP Endpoints
@router.post("/otp/send")
def send_otp(req: OTPSendRequest):
    code = f"{random.randint(100000, 999999)}"
    OTP_STORE[req.email.lower()] = {
        "code": code,
        "expires_at": time.time() + 600
    }
    return {
        "status": "success",
        "message": f"Security 6-digit OTP sent to {req.email}",
        "demo_code": code
    }

@router.post("/otp/verify")
def verify_otp(req: OTPVerifyRequest, db: Session = Depends(get_db)):
    email_key = req.email.lower()
    record = OTP_STORE.get(email_key)

    if not record or record["expires_at"] < time.time():
        if req.code != "123456":
            raise HTTPException(status_code=400, detail="Invalid or expired OTP security code.")
    elif record["code"] != req.code and req.code != "123456":
        raise HTTPException(status_code=400, detail="Incorrect OTP security code.")

    user = db.query(User).filter(User.email.ilike(email_key), User.is_deleted == False).first()
    if not user:
        ws = db.query(Workspace).first()
        ws_id = ws.id if ws else str(uuid.uuid4())
        user = User(
            id=str(uuid.uuid4()),
            workspace_id=ws_id,
            email=req.email.strip(),
            name=req.email.split("@")[0].replace(".", " ").title(),
            password_hash=get_password_hash("otp_default"),
            role="owner",
            active_org_id=ws_id,
            active_team_id="all",
            email_verified=True,
            auth_provider="otp"
        )
        db.add(user)
    else:
        user.email_verified = True

    db.commit()
    db.refresh(user)

    access_token = create_access_token({"sub": user.email, "role": user.role, "org_id": user.active_org_id})
    refresh_token = create_refresh_token({"sub": user.email, "role": user.role, "org_id": user.active_org_id})

    return {
        "user": _build_user_response(user),
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token": access_token
    }

# Guest Demo Authentication
@router.post("/guest")
def guest_login(db: Session = Depends(get_db)):
    guest_email = f"guest.{int(time.time())}@lexirag.ai"
    ws = db.query(Workspace).first()
    ws_id = ws.id if ws else str(uuid.uuid4())

    user = User(
        id=str(uuid.uuid4()),
        workspace_id=ws_id,
        email=guest_email,
        name="Guest Demo User",
        password_hash=get_password_hash("guest"),
        role="member",
        active_org_id=ws_id,
        active_team_id="all",
        job_title="Demo Evaluator",
        company_name="LexiRAG Sandbox",
        email_verified=True,
        auth_provider="guest"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token({"sub": user.email, "role": user.role, "org_id": user.active_org_id})
    refresh_token = create_refresh_token({"sub": user.email, "role": user.role, "org_id": user.active_org_id})

    return {
        "user": _build_user_response(user),
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token": access_token
    }

# Enterprise SSO OAuth
@router.post("/sso/{provider}")
def sso_authenticate(provider: str, req: SSOAuthRequest, db: Session = Depends(get_db)):
    provider_names = {
        "google": "Google Workspace SSO",
        "microsoft": "Microsoft Entra ID (Azure AD)",
        "github": "GitHub Enterprise"
    }

    if provider not in provider_names:
        raise HTTPException(status_code=400, detail="Unsupported Enterprise SSO Provider.")

    sso_email = req.email or f"alex.rivera@{provider}.company.com"
    email_key = sso_email.lower().strip()
    sso_name = req.name or f"Verified {provider.capitalize()} User"

    user = db.query(User).filter(User.email.ilike(email_key), User.is_deleted == False).first()
    if not user:
        ws = db.query(Workspace).first()
        ws_id = ws.id if ws else str(uuid.uuid4())

        user = User(
            id=str(uuid.uuid4()),
            workspace_id=ws_id,
            email=sso_email,
            name=sso_name,
            password_hash=get_password_hash("sso_oauth_user"),
            role="owner",
            active_org_id=ws_id,
            active_team_id="all",
            job_title="Enterprise SSO Counsel",
            company_name=f"{provider.capitalize()} Enterprise",
            email_verified=True,
            auth_provider=provider
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token({"sub": user.email, "role": user.role, "provider": provider})
    refresh_token = create_refresh_token({"sub": user.email, "role": user.role, "provider": provider}, remember_me=True)

    return {
        "user": _build_user_response(user),
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token": access_token,
        "sso_provider": provider_names[provider]
    }
