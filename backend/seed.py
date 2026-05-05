"""Idempotent seeder for the ZHELTA Systems Portal.
Creates the super_admin (zt@zhelta.com) plus a small set of demo users + sample data.
Safe to run on every startup — only inserts what doesn't already exist.
"""
import uuid
from datetime import datetime, timedelta, timezone
from auth_utils import hash_password


SUPER_ADMIN_EMAIL = "zt@zhelta.com"
SUPER_ADMIN_PASSWORD = "ZheltaAdmin@2026!"


async def seed_demo(db):
    now = datetime.now(timezone.utc)

    # ---- Super admin (root account, immutable) ----
    if not await db.users.find_one({"email": SUPER_ADMIN_EMAIL}):
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": SUPER_ADMIN_EMAIL,
            "name": "ZHELTA Owner",
            "role": "super_admin",
            "org_id": None,
            "org_name": "ZHELTA Systems",
            "password_hash": hash_password(SUPER_ADMIN_PASSWORD),
            "plan": "enterprise",
            "is_active": True,
            "invited_by": None,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
        })

    # If we already have other users, stop — only re-seed an empty database.
    if await db.users.count_documents({"role": {"$ne": "super_admin"}}) > 0:
        return

    admin_id = str(uuid.uuid4())
    engineer_id = str(uuid.uuid4())
    client_id = str(uuid.uuid4())
    org_id = str(uuid.uuid4())

    await db.users.insert_many([
        {"id": admin_id, "email": "admin@zheltasystems.com", "name": "Internal Admin",
         "role": "admin", "org_id": None, "org_name": "ZHELTA Systems",
         "password_hash": hash_password("Demo@2026!"),
         "plan": None, "is_active": True, "invited_by": None,
         "created_at": now.isoformat(), "updated_at": now.isoformat()},
        {"id": engineer_id, "email": "engineer@zheltasystems.com", "name": "Field Engineer",
         "role": "engineer", "org_id": None, "org_name": "ZHELTA Systems",
         "password_hash": hash_password("Demo@2026!"),
         "plan": None, "is_active": True, "invited_by": None,
         "created_at": now.isoformat(), "updated_at": now.isoformat()},
        {"id": client_id, "email": "client@acme.com", "name": "Acme Operations",
         "role": "client", "org_id": org_id, "org_name": "Acme Industries",
         "password_hash": hash_password("Demo@2026!"),
         "plan": "professional", "is_active": True, "invited_by": None,
         "created_at": now.isoformat(), "updated_at": now.isoformat()},
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
        {"id": str(uuid.uuid4()), "actor": SUPER_ADMIN_EMAIL, "action": "seeded portal database",
         "target": "ZHELTA Systems Portal", "ts": now.isoformat()},
    ])
