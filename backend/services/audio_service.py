import sqlite_utils
import logging
from config import settings
from datetime import datetime
from typing import List, Optional

logger = logging.getLogger(__name__)

ALLOWED_MIME_TYPES = {
    "audio/wav", "audio/wave", "audio/x-wav",
    "audio/mpeg", "audio/mp3",
    "audio/webm", "audio/ogg",
    "audio/mp4", "audio/m4a",
}

MAX_SIZE_BYTES = settings.max_upload_size_mb * 1024 * 1024


def validate_audio_file(filename: str, content_type: str, size: int) -> tuple[bool, str]:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    allowed_exts = {"wav", "mp3", "webm", "ogg", "m4a", "mp4"}
    if ext not in allowed_exts:
        return False, f"File type .{ext} not supported. Use WAV, MP3, WebM, OGG, or M4A."
    if content_type not in ALLOWED_MIME_TYPES and not content_type.startswith("audio/"):
        return False, f"Invalid content type: {content_type}"
    if size > MAX_SIZE_BYTES:
        return False, f"File too large. Maximum size is {settings.max_upload_size_mb}MB."
    return True, ""


def get_db():
    from models.user import get_db as _get_db
    return _get_db()


def save_analysis(risk_score: int, status: str, scam_type: Optional[str],
                  transcript: str, is_demo: bool, user_id: int = 0):
    try:
        db = get_db()
        db["analyses"].insert({
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat(),
            "risk_score": risk_score,
            "status": status,
            "scam_type": scam_type or "",
            "transcript_preview": transcript[:200] if transcript else "",
            "is_demo": 1 if is_demo else 0,
        })
    except Exception as e:
        logger.error(f"DB save error: {e}")


def get_recent_analyses(limit: int = 10, user_id: Optional[int] = None) -> List[dict]:
    try:
        db = get_db()
        if user_id:
            rows = list(db["analyses"].rows_where(
                "user_id = ?", [user_id], order_by="id desc", limit=limit
            ))
        else:
            rows = list(db["analyses"].rows_where(order_by="id desc", limit=limit))
        return rows
    except Exception as e:
        logger.error(f"DB read error: {e}")
        return []
