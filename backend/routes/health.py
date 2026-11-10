from fastapi import APIRouter, Depends
from dependencies import get_optional_user
from typing import Optional

router = APIRouter()


@router.get("/health")
async def health_check():
    from config import settings
    return {
        "status": "ok",
        "service": "Suraksha Call API",
        "version": "2.0.0",
        "demo_mode": settings.demo_mode,
        "gnani_configured": not settings.demo_mode,
        "author": "Chaitanya Sanjay Jogekar",
    }


@router.get("/recent-analyses")
async def get_recent(current_user: Optional[dict] = Depends(get_optional_user)):
    from services.audio_service import get_recent_analyses
    uid = current_user["id"] if current_user else None
    rows = get_recent_analyses(10, user_id=uid)
    return {"analyses": rows}
