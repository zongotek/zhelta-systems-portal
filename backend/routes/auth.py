import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr

from auth_utils import current_user, hash_password, make_token, verify_password
from database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterReq(BaseModel):
    email: EmailStr
    password: str
    org_name: str | None = None


class LoginReq(BaseModel):
    email: EmailStr
    password: str


@router.post("/register", status_code=201)
async def register(payload: RegisterReq):
    db = get_db()
    if await db.users.find_one({"email": payload.email.lower()}):
        raise HTTPException(status_code=409, detail="Email already registered")
    org_id = str(uuid.uuid4())
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    await db.organizations.insert_one({
        "id": org_id, "name": payload.org_name or payload.email.split("@")[1],
        "plan": "essential", "mrr_usd": 499, "status": "trialing",
        "next_renewal": now[:10], "created_at": now,
    })
    user = {"id": user_id, "email": payload.email.lower(), "role": "client",
            "org_id": org_id, "org_name": payload.org_name, "plan": "essential",
            "password_hash": hash_password(payload.password), "created_at": now}
    await db.users.insert_one(user)
    user.pop("password_hash"); user.pop("_id", None)
    return {"token": make_token(user_id), "user": user}


@router.post("/login")
async def login(payload: LoginReq):
    db = get_db()
    u = await db.users.find_one({"email": payload.email.lower()})
    if not u or not verify_password(payload.password, u.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    u.pop("password_hash"); u.pop("_id", None)
    return {"token": make_token(u["id"]), "user": u}


@router.get("/me")
async def me(user=Depends(current_user)):
    return user
