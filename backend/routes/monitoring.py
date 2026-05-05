from fastapi import APIRouter, Depends
from auth_utils import current_user

router = APIRouter(prefix="/api/monitoring", tags=["monitoring"])


@router.get("")
async def status(user=Depends(current_user)):
    # Static synthetic status. Wire to real probes later.
    return {
        "uptime_30d": 99.96,
        "services": [
            {"name": "Edge firewall", "region": "us-east-1", "status": "operational"},
            {"name": "VPN gateway", "region": "us-east-1", "status": "degraded"},
            {"name": "Mail relay", "region": "us-west-2", "status": "operational"},
            {"name": "Backup vault", "region": "us-east-2", "status": "operational"},
            {"name": "MDM control", "region": "eu-west-1", "status": "operational"},
            {"name": "Identity (SSO)", "region": "global", "status": "operational"},
        ],
    }
