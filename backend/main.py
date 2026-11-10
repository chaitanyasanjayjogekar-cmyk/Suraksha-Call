from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import sys

from config import settings
from routes.health import router as health_router
from routes.analysis import router as analysis_router
from routes.websocket import router as ws_router
from routes.auth import router as auth_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Suraksha Call API",
    description="Live Scam Call Detector — Powered by Gnani AI | Built by Chaitanya Sanjay Jogekar",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health_router, prefix="/api")
app.include_router(auth_router)                   # /api/auth/...
app.include_router(analysis_router, prefix="/api")
app.include_router(ws_router)


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again."},
    )


@app.on_event("startup")
async def startup():
    # Ensure all DB tables exist on startup
    from models.user import get_db
    get_db()
    logger.info(f"Suraksha Call API v2.0 started — Demo Mode: {settings.demo_mode}")
    if settings.demo_mode:
        logger.warning("Running in DEMO MODE. Add GNANI_API_KEY to .env for live AI analysis.")


@app.get("/")
async def root():
    return {
        "service": "Suraksha Call API",
        "version": "2.0.0",
        "tagline": "Scam ko number se nahi, baaton se pehchano",
        "author": "Chaitanya Sanjay Jogekar",
        "docs": "/api/docs",
        "health": "/api/health",
        "demo_mode": settings.demo_mode,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
