from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from auth_utils import current_user, require_admin
from database import get_db

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/client")
async def client_dashboard(user=Depends(current_user)):
    db = get_db()
    org_id = user.get("org_id")
    devices = await db.devices.count_documents({"org_id": org_id})
    open_tickets = await db.tickets.count_documents({"org_id": org_id, "status": {"$in": ["open", "in_progress"]}})
    org = await db.organizations.find_one({"id": org_id}, {"_id": 0})
    return {
        "devices": devices,
        "open_tickets": open_tickets,
        "uptime_30d": 99.96,
        "plan": (org or {}).get("plan", user.get("plan", "essential")),
        "next_renewal": (org or {}).get("next_renewal"),
    }


@router.get("/admin")
async def admin_dashboard(_=Depends(require_admin)):
    db = get_db()
    clients = await db.users.count_documents({"role": "client"})
    devices = await db.devices.count_documents({})
    open_tickets = await db.tickets.count_documents({"status": {"$in": ["open", "in_progress"]}})
    orgs = await db.organizations.find({}, {"_id": 0}).to_list(500)
    mrr = sum(o.get("mrr_usd", 0) for o in orgs if o.get("status") in {"active", "trialing"})
    tiers = {"essential": 0, "professional": 0, "enterprise": 0}
    for o in orgs:
        p = (o.get("plan") or "").lower()
        if p in tiers: tiers[p] += 1
    return {"clients": clients, "devices": devices, "open_tickets": open_tickets,
            "mrr_usd": mrr, "tiers": tiers, "sla_pct": 98.4}
