from fastapi import APIRouter, Depends
from auth_utils import require_admin
from database import get_db

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/clients")
async def list_clients(_=Depends(require_admin)):
    db = get_db()
    users = await db.users.find({"role": "client"}, {"_id": 0, "password_hash": 0}).to_list(500)
    out = []
    for u in users:
        devices_count = await db.devices.count_documents({"org_id": u.get("org_id")})
        out.append({**u, "devices_count": devices_count})
    return {"clients": out}


@router.get("/subscriptions")
async def list_subscriptions(_=Depends(require_admin)):
    db = get_db()
    orgs = await db.organizations.find({}, {"_id": 0}).to_list(500)
    return {"subscriptions": orgs}


@router.get("/activity")
async def list_activity(_=Depends(require_admin)):
    db = get_db()
    events = await db.activity.find({}, {"_id": 0}).sort("ts", -1).limit(100).to_list(100)
    return {"events": events}
