import os
from motor.motor_asyncio import AsyncIOMotorClient

_client: AsyncIOMotorClient | None = None
_db = None


async def connect_db():
    global _client, _db
    _client = AsyncIOMotorClient(os.environ.get("MONGO_URL", "mongodb://localhost:27017"))
    _db = _client[os.environ.get("DB_NAME", "zhelta_systems_portal")]


async def close_db():
    global _client
    if _client:
        _client.close()


def get_db():
    if _db is None:
        raise RuntimeError("DB not initialized")
    return _db
