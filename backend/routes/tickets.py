import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from auth_utils import current_user
from database import get_db

router = APIRouter(prefix="/api/tickets", tags=["tickets"])


class TicketCreate(BaseModel):
    title: str = Field(min_length=2, max_length=160)
    body: str = ""
    priority: str = "normal"  # low | normal | high | urgent


@router.get("")
async def list_tickets(user=Depends(current_user)):
    db = get_db()
    q = {} if user["role"] == "admin" else {"org_id": user.get("org_id")}
    docs = await db.tickets.find(q, {"_id": 0}).sort("created_at", -1).limit(200).to_list(200)
    return {"tickets": docs}


@router.post("", status_code=201)
async def create_ticket(payload: TicketCreate, user=Depends(current_user)):
    if payload.priority not in {"low", "normal", "high", "urgent"}:
        raise HTTPException(status_code=400, detail="Invalid priority")
    db = get_db()
    doc = {
        "id": str(uuid.uuid4()),
        "org_id": user.get("org_id"),
        "owner_id": user["id"],
        "title": payload.title,
        "body": payload.body,
        "priority": payload.priority,
        "status": "open",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.tickets.insert_one(doc)
    doc.pop("_id", None)
    return doc
