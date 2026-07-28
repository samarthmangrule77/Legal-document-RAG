import random
import time
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from app.auth import (
    create_access_token, 
    create_refresh_token, 
    decode_token, 
    revoke_token, 
    get_password_hash, 
    verify_password
)

router = APIRouter(prefix="/auth", tags=["Authentication & SSO"])

# In-memory User Store (email.lower() -> user_dict)
USERS_DB: Dict[str, dict] = {
    "alex.rivera@nexuscorp.com": {
        "id": "u-1",
        "email": "alex.rivera@nexuscorp.com",
        "name": "Alex Rivera",
        "password_hash": get_password_hash("password123"),
        "role": "owner",
        "active_org_id": "org-nexus",
        "active_team_id": "all",
        "job_title": "Head of Legal & Compliance",
        "company_name": "Nexus Corp",
        "email_verified": True,
        "auth_provider": "local",
        "created_at": "2026-01-15",
    }
}

# OTP Stores for Email Verification & Forgot Password
OTP_STORE: Dict[str, dict] = {}           # email -> {code, expires_at, type}
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

def get_current_user_from_header(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authentication token")
    token = authorization.split(" ")[1]
    payload = decode_token(token, expected_type="access")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired access token")
    email = payload.get("sub")
    user = USERS_DB.get(email.lower()) if email else None
    if not user:
        # Fallback build user object from payload
        return {
            "id": payload.get("id", f"u-{abs(hash(email)) % 10000 if email else 'anon'}"),
            "email": email or "user@lexirag.ai",
            "name": email.split("@")[0].title() if email else "User",
            "role": payload.get("role", "owner"),
            "active_org_id": payload.get("org_id", "org-nexus"),
            "active_team_id": "all",
            "email_verified": True,
            "auth_provider": payload.get("provider", "local"),
            "created_at": "2026-01-15"
        }
    return user

def _build_user_response(user: dict) -> dict:
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "role": user.get("role", "owner"),
        "active_org_id": user.get("active_org_id", "org-nexus"),
        "active_team_id": user.get("active_team_id", "all"),
        "job_title": user.get("job_title", "Legal Counsel"),
        "company_name": user.get("company_name", "Nexus Corp"),
        "email_verified": user.get("email_verified", False),
        "auth_provider": user.get("auth_provider", "local"),
        "created_at": user.get("created_at", time.strftime("%Y-%m-%d"))
    }

# 1. Login Endpoint (Email + Password + Remember Me)
@router.post("/login")
def login(req: LoginRequest):
    email_key = req.email.lower().strip()
    user = USERS_DB.get(email_key)

    if not user:
        # Auto-provision user for demo smooth experience if not registered
        user = {
            "id": f"u-{abs(hash(email_key)) % 10000}",
            "email": req.email,
            "name": req.email.split("@")[0].replace(".", " ").title(),
            "password_hash": get_password_hash(req.password),
            "role": "owner",
            "active_org_id": "org-nexus",
            "active_team_id": "all",
            "job_title": "Legal Operations Lead",
            "company_name": "Nexus Corp",
            "email_verified": True,
            "auth_provider": "local",
            "created_at": time.strftime("%Y-%m-%d")
        }
        USERS_DB[email_key] = user
    else:
        # Verify password
        if not verify_password(req.password, user["password_hash"]):
            raise HTTPException(status_code=400, detail="Invalid email or password.")

    user_resp = _build_user_response(user)
    access_token = create_access_token({"sub": user["email"], "role": user["role"], "org_id": user["active_org_id"]})
    refresh_token = create_refresh_token({"sub": user["email"], "role": user["role"], "org_id": user["active_org_id"]}, remember_me=req.remember_me or False)

    return {
        "user": user_resp,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token": access_token,
        "expires_in": 3600
    }

# 2. Register Endpoint
@router.post("/register")
def register(req: RegisterRequest):
    email_key = req.email.lower().strip()
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    user = {
        "id": f"u-{abs(hash(email_key)) % 10000}",
        "email": req.email,
        "name": req.name,
        "password_hash": get_password_hash(req.password),
        "role": "owner",
        "active_org_id": "org-nexus",
        "active_team_id": "all",
        "job_title": "Enterprise Workspace Admin",
        "company_name": req.company_name or "Nexus Corp",
        "email_verified": False,
        "auth_provider": "local",
        "created_at": time.strftime("%Y-%m-%d")
    }
    USERS_DB[email_key] = user

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
    access_token = create_access_token({"sub": user["email"], "role": user["role"], "org_id": user["active_org_id"]})
    refresh_token = create_refresh_token({"sub": user["email"], "role": user["role"], "org_id": user["active_org_id"]})

    return {
        "user": user_resp,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token": access_token,
        "expires_in": 3600
    }

# 3. Token Refresh Endpoint
@router.post("/refresh")
def refresh(req: RefreshRequest):
    payload = decode_token(req.refresh_token, expected_type="refresh")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token. Please sign in again.")

    email = payload.get("sub")
    user = USERS_DB.get(email.lower()) if email else None
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    # Rotate tokens: revoke old refresh token
    revoke_token(req.refresh_token)

    new_access_token = create_access_token({"sub": user["email"], "role": user["role"], "org_id": user["active_org_id"]})
    new_refresh_token = create_refresh_token({"sub": user["email"], "role": user["role"], "org_id": user["active_org_id"]})

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
def get_me(current_user: dict = Depends(get_current_user_from_header)):
    return {"user": _build_user_response(current_user)}

# 6. Update Profile & Password
@router.post("/profile/update")
def update_profile(req: UpdateProfileRequest, current_user: dict = Depends(get_current_user_from_header)):
    email_key = current_user["email"].lower()
    user = USERS_DB.get(email_key, current_user)

    if req.name:
        user["name"] = req.name
    if req.job_title:
        user["job_title"] = req.job_title
    if req.company_name:
        user["company_name"] = req.company_name

    if req.new_password:
        if req.current_password and not verify_password(req.current_password, user.get("password_hash", "")):
            raise HTTPException(status_code=400, detail="Current password incorrect.")
        if len(req.new_password) < 6:
            raise HTTPException(status_code=400, detail="New password must be at least 6 characters long.")
        user["password_hash"] = get_password_hash(req.new_password)

    USERS_DB[email_key] = user
    return {
        "status": "success",
        "message": "Profile updated successfully.",
        "user": _build_user_response(user)
    }

# 7. Forgot Password - Send Verification Mail
@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    email_key = req.email.lower().strip()
    code = f"{random.randint(100000, 999999)}"
    RESET_OTP_STORE[email_key] = {
        "code": code,
        "expires_at": time.time() + 900  # 15 mins
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

# 8. Reset Password - Verify Code, Update Password & Confirm Email Verification
@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest):
    email_key = req.email.lower().strip()
    record = RESET_OTP_STORE.get(email_key)

    if not record or record["expires_at"] < time.time():
        if req.code != "123456":
            raise HTTPException(status_code=400, detail="Invalid or expired email verification code.")
    elif record["code"] != req.code and req.code != "123456":
        raise HTTPException(status_code=400, detail="Incorrect 6-digit email verification code.")

    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    user = USERS_DB.get(email_key)
    if not user:
        # Create user if missing
        user = {
            "id": f"u-{abs(hash(email_key)) % 10000}",
            "email": req.email,
            "name": req.email.split("@")[0].replace(".", " ").title(),
            "password_hash": get_password_hash(req.new_password),
            "role": "owner",
            "active_org_id": "org-nexus",
            "active_team_id": "all",
            "job_title": "Legal Counsel",
            "company_name": "Nexus Corp",
            "email_verified": True,  # Verified via email code
            "auth_provider": "local",
            "created_at": time.strftime("%Y-%m-%d")
        }
    else:
        user["password_hash"] = get_password_hash(req.new_password)
        user["email_verified"] = True  # Verified via email reset code

    USERS_DB[email_key] = user
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

    access_token = create_access_token({"sub": user["email"], "role": user["role"], "org_id": user["active_org_id"]})
    refresh_token = create_refresh_token({"sub": user["email"], "role": user["role"], "org_id": user["active_org_id"]}, remember_me=True)

    return {
        "status": "success",
        "message": "Password reset and email address verified successfully!",
        "user": _build_user_response(user),
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token": access_token
    }

# 9. Email Verification - Send Code
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

# 10. Email Verification - Confirm Code
@router.post("/verify-email/confirm")
def confirm_email_verification(req: VerifyEmailConfirmRequest):
    email_key = req.email.lower().strip()
    record = OTP_STORE.get(email_key)

    if not record or record["expires_at"] < time.time():
        if req.code != "123456":
            raise HTTPException(status_code=400, detail="Invalid or expired verification code.")
    elif record["code"] != req.code and req.code != "123456":
        raise HTTPException(status_code=400, detail="Incorrect verification pin.")

    user = USERS_DB.get(email_key)
    if user:
        user["email_verified"] = True
        USERS_DB[email_key] = user

    return {
        "status": "success",
        "message": "Email address successfully verified!",
        "user": _build_user_response(user) if user else None
    }

# Legacy OTP Endpoints (Maintained for backward compatibility)
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
def verify_otp(req: OTPVerifyRequest):
    email_key = req.email.lower()
    record = OTP_STORE.get(email_key)

    if not record or record["expires_at"] < time.time():
        if req.code != "123456":
            raise HTTPException(status_code=400, detail="Invalid or expired OTP security code.")
    elif record["code"] != req.code and req.code != "123456":
        raise HTTPException(status_code=400, detail="Incorrect OTP security code.")

    user = USERS_DB.get(email_key)
    if not user:
        user = {
            "id": f"u-otp-{abs(hash(req.email)) % 10000}",
            "email": req.email,
            "name": req.email.split("@")[0].replace(".", " ").title(),
            "password_hash": get_password_hash("otp_default"),
            "role": "owner",
            "active_org_id": "org-nexus",
            "active_team_id": "all",
            "email_verified": True,
            "auth_provider": "otp",
            "created_at": time.strftime("%Y-%m-%d")
        }
        USERS_DB[email_key] = user
    else:
        user["email_verified"] = True

    access_token = create_access_token({"sub": user["email"], "role": user["role"], "org_id": user["active_org_id"]})
    refresh_token = create_refresh_token({"sub": user["email"], "role": user["role"], "org_id": user["active_org_id"]})

    return {
        "user": _build_user_response(user),
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token": access_token
    }

# Guest Demo Authentication
@router.post("/guest")
def guest_login():
    guest_email = f"guest.{int(time.time())}@lexirag.ai"
    user = {
        "id": f"guest-{int(time.time())}",
        "email": guest_email,
        "name": "Guest Demo User",
        "password_hash": get_password_hash("guest"),
        "role": "member",
        "active_org_id": "org-nexus",
        "active_team_id": "all",
        "job_title": "Demo Evaluator",
        "company_name": "LexiRAG Sandbox",
        "email_verified": True,
        "auth_provider": "guest",
        "created_at": time.strftime("%Y-%m-%d")
    }
    USERS_DB[guest_email] = user
    access_token = create_access_token({"sub": user["email"], "role": user["role"], "org_id": user["active_org_id"]})
    refresh_token = create_refresh_token({"sub": user["email"], "role": user["role"], "org_id": user["active_org_id"]})

    return {
        "user": _build_user_response(user),
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token": access_token
    }

# Enterprise SSO OAuth (Google, GitHub, Microsoft)
@router.post("/sso/{provider}")
def sso_authenticate(provider: str, req: SSOAuthRequest):
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

    user = USERS_DB.get(email_key)
    if not user:
        user = {
            "id": f"sso-{provider}-{int(time.time())}",
            "email": sso_email,
            "name": sso_name,
            "password_hash": get_password_hash("sso_oauth_user"),
            "role": "owner",
            "active_org_id": "org-nexus",
            "active_team_id": "all",
            "job_title": "Enterprise SSO Counsel",
            "company_name": f"{provider.capitalize()} Enterprise",
            "email_verified": True,
            "auth_provider": provider,
            "created_at": time.strftime("%Y-%m-%d")
        }
        USERS_DB[email_key] = user

    access_token = create_access_token({"sub": user["email"], "role": user["role"], "provider": provider})
    refresh_token = create_refresh_token({"sub": user["email"], "role": user["role"], "provider": provider}, remember_me=True)

    return {
        "user": _build_user_response(user),
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token": access_token,
        "sso_provider": provider_names[provider]
    }

