import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database import connect_db, close_db, get_db
from seed import seed_demo
from routes.auth import router as auth_router
from routes.devices import router as devices_router
from routes.tickets import router as tickets_router
from routes.monitoring import router as monitoring_router
from routes.services import router as services_router
from routes.billing import router as billing_router
from routes.dashboard import router as dashboard_router
from routes.admin import router as admin_router

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    db = get_db()
    await seed_demo(db)
    yield
    await close_db()


app = FastAPI(title="ZHELTA Systems Portal API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "zhelta-systems-portal"}


for r in (auth_router, devices_router, tickets_router, monitoring_router,
          services_router, billing_router, dashboard_router, admin_router):
    app.include_router(r)
