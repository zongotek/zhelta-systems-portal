import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, Header, HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext

from database import get_db

JWT_SECRET = os.environ.get("JWT_SECRET", "change-me")
ALGORITHM = "HS256"
TOKEN_TTL_HOURS = 24 * 7

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Role hierarchy. Higher number = more power.
ROLE_RANK = {"client": 0, "support": 1, "engineer": 2, "admin": 3, "super_admin": 4}
INTERNAL_ROLES = {"super_admin", "admin", "engineer", "support"}
ASSIGNABLE_ROLES = ["super_admin", "admin", "engineer", "support", "client"]


def can_manage(actor_role: str, target_role: str) -> bool:
    """Actor can manage target only if strictly higher rank.
    Super admin manages everyone (including other super admins — but seed protects last one).
    """
    return ROLE_RANK.get(actor_role, -1) > ROLE_RANK.get(target_role, -1) or actor_role == "super_admin"


def hash_password(p: str) -> str:
    return _pwd.hash(p)


def verify_password(p: str, h: str) -> bool:
    try:
        return _pwd.verify(p, h)
    except Exception:
        return False


def make_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=TOKEN_TTL_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)


async def current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ", 1)[1].strip()
    try:
        data = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    db = get_db()
    user = await db.users.find_one({"id": data["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if user.get("is_active") is False:
        raise HTTPException(status_code=403, detail="Account revoked")
    return user


async def require_admin(user=Depends(current_user)):
    if user.get("role") not in {"super_admin", "admin"}:
        raise HTTPException(status_code=403, detail="Admin only")
    return user


async def require_super_admin(user=Depends(current_user)):
    if user.get("role") != "super_admin":
        raise HTTPException(status_code=403, detail="Super admin only")
    return user


async def require_internal(user=Depends(current_user)):
    if user.get("role") not in INTERNAL_ROLES:
        raise HTTPException(status_code=403, detail="Internal staff only")
    return user
