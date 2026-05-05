"""User management — super_admin / admin can create / edit / revoke / delete users."""
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field

from auth_utils import (
    ASSIGNABLE_ROLES, can_manage, current_user, hash_password,
    require_admin, require_super_admin,
)
from database import get_db

router = APIRouter(prefix="/api/admin/users", tags=["admin-users"])


class UserCreate(BaseModel):
    email: EmailStr
    name: str = ""
    role: str  # any of ASSIGNABLE_ROLES (subject to can_manage check)
    password: str = Field(min_length=6)
    org_name: str | None = None


class UserUpdate(BaseModel):
    name: str | None = None
    role: str | None = None
    org_name: str | None = None
    is_active: bool | None = None


class PasswordReset(BaseModel):
    new_password: str = Field(min_length=6)


def _public(u: dict) -> dict:
    u = {**u}
    u.pop("password_hash", None)
    u.pop("_id", None)
    return u


async def _log(db, actor: dict, action: str, target: str):
    await db.activity.insert_one({
        "id": str(uuid.uuid4()),
        "actor": actor.get("email"),
        "action": action,
        "target": target,
        "ts": datetime.now(timezone.utc).isoformat(),
    })


@router.get("")
async def list_users(actor=Depends(require_admin)):
    db = get_db()
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(500)
    return {"users": users}


@router.post("", status_code=201)
async def create_user(payload: UserCreate, actor=Depends(require_admin)):
    if payload.role not in ASSIGNABLE_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")
    if not can_manage(actor["role"], payload.role):
        raise HTTPException(status_code=403, detail="You cannot create a user of that role")
    db = get_db()
    if await db.users.find_one({"email": payload.email.lower()}):
        raise HTTPException(status_code=409, detail="Email already registered")
    now = datetime.now(timezone.utc).isoformat()
    org_id = None
    if payload.role == "client" and payload.org_name:
        org_id = str(uuid.uuid4())
        await db.organizations.insert_one({
            "id": org_id, "name": payload.org_name,
            "plan": "essential", "mrr_usd": 499, "status": "trialing",
            "next_renewal": now[:10], "created_at": now,
        })
    user = {
        "id": str(uuid.uuid4()),
        "email": payload.email.lower(),
        "name": payload.name or payload.email.split("@")[0],
        "role": payload.role,
        "org_id": org_id,
        "org_name": payload.org_name,
        "plan": "essential" if payload.role == "client" else None,
        "password_hash": hash_password(payload.password),
        "is_active": True,
        "invited_by": actor["id"],
        "created_at": now,
        "updated_at": now,
    }
    await db.users.insert_one(user)
    await _log(db, actor, f"created {payload.role}", payload.email)
    return _public(user)


@router.patch("/{user_id}")
async def update_user(user_id: str, payload: UserUpdate, actor=Depends(require_admin)):
    db = get_db()
    target = await db.users.find_one({"id": user_id})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if not can_manage(actor["role"], target["role"]):
        raise HTTPException(status_code=403, detail="You cannot manage this user")

    update: dict = {}
    if payload.name is not None: update["name"] = payload.name
    if payload.org_name is not None: update["org_name"] = payload.org_name
    if payload.role is not None:
        if payload.role not in ASSIGNABLE_ROLES:
            raise HTTPException(status_code=400, detail="Invalid role")
        if not can_manage(actor["role"], payload.role):
            raise HTTPException(status_code=403, detail="You cannot assign that role")
        if target["role"] == "super_admin" and payload.role != "super_admin":
            # Don't allow demoting the last super_admin
            count = await db.users.count_documents({"role": "super_admin", "is_active": True})
            if count <= 1:
                raise HTTPException(status_code=400, detail="Cannot demote the last super admin")
        update["role"] = payload.role
    if payload.is_active is not None:
        if target["role"] == "super_admin" and payload.is_active is False:
            count = await db.users.count_documents({"role": "super_admin", "is_active": True})
            if count <= 1:
                raise HTTPException(status_code=400, detail="Cannot revoke the last super admin")
        update["is_active"] = payload.is_active

    if not update:
        return _public(target)
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.users.update_one({"id": user_id}, {"$set": update})
    await _log(db, actor, "updated user", target["email"])
    target = await db.users.find_one({"id": user_id})
    return _public(target)


@router.post("/{user_id}/revoke")
async def revoke_user(user_id: str, actor=Depends(require_admin)):
    return await update_user(user_id, UserUpdate(is_active=False), actor)


@router.post("/{user_id}/restore")
async def restore_user(user_id: str, actor=Depends(require_admin)):
    return await update_user(user_id, UserUpdate(is_active=True), actor)


@router.post("/{user_id}/reset-password")
async def reset_password(user_id: str, payload: PasswordReset, actor=Depends(require_admin)):
    db = get_db()
    target = await db.users.find_one({"id": user_id})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if not can_manage(actor["role"], target["role"]):
        raise HTTPException(status_code=403, detail="You cannot manage this user")
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"password_hash": hash_password(payload.new_password),
                  "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    await _log(db, actor, "reset password", target["email"])
    return {"ok": True}


@router.delete("/{user_id}")
async def delete_user(user_id: str, actor=Depends(require_admin)):
    db = get_db()
    target = await db.users.find_one({"id": user_id})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target["role"] == "super_admin":
        count = await db.users.count_documents({"role": "super_admin"})
        if count <= 1:
            raise HTTPException(status_code=400, detail="Cannot delete the last super admin")
        if actor["role"] != "super_admin":
            raise HTTPException(status_code=403, detail="Only a super admin can delete a super admin")
    if not can_manage(actor["role"], target["role"]):
        raise HTTPException(status_code=403, detail="You cannot delete this user")
    if target["id"] == actor["id"]:
        raise HTTPException(status_code=400, detail="You cannot delete yourself")
    await db.users.delete_one({"id": user_id})
    await _log(db, actor, "deleted user", target["email"])
    return {"ok": True, "deleted": user_id}
