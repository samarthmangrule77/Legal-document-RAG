import hmac
import hashlib
import base64
import json
import time
import uuid
from typing import Optional, Set
from app.config import settings

# In-memory token revocation blacklist (for revoked access/refresh tokens)
REVOKED_TOKENS: Set[str] = set()

def _b64_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

def _b64_decode(data: str) -> bytes:
    padding = '=' * (4 - (len(data) % 4))
    return base64.urlsafe_b64decode(data + padding)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    expected = hashlib.sha256((plain_password + settings.SECRET_KEY).encode()).hexdigest()
    return hmac.compare_digest(expected, hashed_password)

def get_password_hash(password: str) -> str:
    return hashlib.sha256((password + settings.SECRET_KEY).encode()).hexdigest()

def create_access_token(data: dict, expires_delta: Optional[int] = None) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = data.copy()
    payload["type"] = "access"
    payload["jti"] = str(uuid.uuid4())
    expire = int(time.time()) + (expires_delta if expires_delta is not None else 3600)  # Default 60 mins
    payload["exp"] = expire

    header_b64 = _b64_encode(json.dumps(header).encode('utf-8'))
    payload_b64 = _b64_encode(json.dumps(payload).encode('utf-8'))
    message = f"{header_b64}.{payload_b64}"

    signature = hmac.new(
        settings.SECRET_KEY.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).digest()
    sig_b64 = _b64_encode(signature)

    return f"{message}.{sig_b64}"

def create_refresh_token(data: dict, remember_me: bool = False) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = data.copy()
    payload["type"] = "refresh"
    payload["jti"] = str(uuid.uuid4())
    # 30 days if remember_me else 7 days
    duration_days = 30 if remember_me else 7
    payload["exp"] = int(time.time()) + (duration_days * 24 * 3600)

    header_b64 = _b64_encode(json.dumps(header).encode('utf-8'))
    payload_b64 = _b64_encode(json.dumps(payload).encode('utf-8'))
    message = f"{header_b64}.{payload_b64}"

    signature = hmac.new(
        settings.SECRET_KEY.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).digest()
    sig_b64 = _b64_encode(signature)

    return f"{message}.{sig_b64}"

def revoke_token(token: str) -> None:
    if token:
        REVOKED_TOKENS.add(token)
        try:
            payload = decode_token(token)
            if payload and "jti" in payload:
                REVOKED_TOKENS.add(payload["jti"])
        except Exception:
            pass

def is_token_revoked(token: str) -> bool:
    if token in REVOKED_TOKENS:
        return True
    try:
        parts = token.split('.')
        if len(parts) == 3:
            payload_b64 = parts[1]
            payload = json.loads(_b64_decode(payload_b64).decode('utf-8'))
            if payload.get("jti") in REVOKED_TOKENS:
                return True
    except Exception:
        pass
    return False

def decode_token(token: str, expected_type: Optional[str] = None) -> Optional[dict]:
    try:
        if is_token_revoked(token):
            return None

        parts = token.split('.')
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        message = f"{header_b64}.{payload_b64}"

        expected_sig = hmac.new(
            settings.SECRET_KEY.encode('utf-8'),
            message.encode('utf-8'),
            hashlib.sha256
        ).digest()

        if not hmac.compare_digest(_b64_encode(expected_sig), sig_b64):
            return None

        payload = json.loads(_b64_decode(payload_b64).decode('utf-8'))
        if payload.get('exp', 0) < time.time():
            return None

        if expected_type and payload.get('type') != expected_type:
            return None

        return payload
    except Exception:
        return None

