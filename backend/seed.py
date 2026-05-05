"""Seed demo accounts + sample data on first start. Idempotent."""
import uuid
from datetime import datetime, timedelta, timezone
from auth_utils import hash_password


async def seed_demo(db):
    if await db.users.count_documents({}) > 0:
        return

    now = datetime.now(timezone.utc)
    admin_id = str(uuid.uuid4())
    client_id = str(uuid.uuid4())
    org_id = str(uuid.uuid4())

    await db.users.insert_many([
        {"id": admin_id, "email": "admin@zheltasystems.com", "role": "admin", "org_id": None,
         "org_name": "ZHELTA Systems", "password_hash": hash_password("Demo@2026!"),
         "plan": "enterprise", "created_at": now.isoformat()},
        {"id": client_id, "email": "client@acme.com", "role": "client", "org_id": org_id,
         "org_name": "Acme Industries", "password_hash": hash_password("Demo@2026!"),
         "plan": "professional", "created_at": now.isoformat()},
    ])

    await db.organizations.insert_one({
        "id": org_id, "name": "Acme Industries", "plan": "professional",
        "mrr_usd": 1499, "status": "active",
        "next_renewal": (now + timedelta(days=23)).date().isoformat(),
        "created_at": now.isoformat(),
    })

    await db.devices.insert_many([
        {"id": str(uuid.uuid4()), "org_id": org_id, "hostname": "ACME-LAP-001", "type": "Laptop", "os": "macOS 14", "status": "online", "last_seen": now.isoformat()},
        {"id": str(uuid.uuid4()), "org_id": org_id, "hostname": "ACME-LAP-002", "type": "Laptop", "os": "Windows 11", "status": "online", "last_seen": now.isoformat()},
        {"id": str(uuid.uuid4()), "org_id": org_id, "hostname": "ACME-SRV-DC1", "type": "Server", "os": "Ubuntu 22.04", "status": "online", "last_seen": now.isoformat()},
        {"id": str(uuid.uuid4()), "org_id": org_id, "hostname": "ACME-FW-EDGE", "type": "Firewall", "os": "FortiOS 7.4", "status": "offline", "last_seen": (now - timedelta(hours=3)).isoformat()},
    ])

    await db.tickets.insert_many([
        {"id": str(uuid.uuid4()), "org_id": org_id, "owner_id": client_id, "title": "VPN drop on remote office",
         "body": "Branch users disconnect every ~30 minutes since this morning.", "priority": "high",
         "status": "open", "created_at": (now - timedelta(hours=4)).isoformat()},
        {"id": str(uuid.uuid4()), "org_id": org_id, "owner_id": client_id, "title": "Onboard 3 new laptops",
         "body": "Standard MDM enrollment for the marketing team.", "priority": "normal",
         "status": "in_progress", "created_at": (now - timedelta(days=1)).isoformat()},
    ])

    await db.activity.insert_many([
        {"id": str(uuid.uuid4()), "actor": "admin@zheltasystems.com", "action": "deployed firewall policy",
         "target": "Acme Industries", "ts": (now - timedelta(minutes=12)).isoformat()},
        {"id": str(uuid.uuid4()), "actor": "client@acme.com", "action": "opened ticket",
         "target": "VPN drop on remote office", "ts": (now - timedelta(hours=4)).isoformat()},
        {"id": str(uuid.uuid4()), "actor": "system", "action": "patched 47 endpoints",
         "target": "Acme Industries", "ts": (now - timedelta(days=1)).isoformat()},
    ])
