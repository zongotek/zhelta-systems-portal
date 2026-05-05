from fastapi import APIRouter, Depends
from auth_utils import current_user
from database import get_db

router = APIRouter(prefix="/api/devices", tags=["devices"])


@router.get("")
async def list_devices(user=Depends(current_user)):
    db = get_db()
    q = {} if user["role"] == "admin" else {"org_id": user.get("org_id")}
    docs = await db.devices.find(q, {"_id": 0}).limit(200).to_list(200)
    return {"devices": docs}
