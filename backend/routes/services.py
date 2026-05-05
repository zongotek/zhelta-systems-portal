from fastapi import APIRouter
from services_catalog import SERVICES

router = APIRouter(prefix="/api/services", tags=["services"])


@router.get("")
async def list_services():
    return {"services": SERVICES}
