import sqlite_utils
import logging
from datetime import datetime
from config import settings

logger = logging.getLogger(__name__)


def get_db() -> sqlite_utils.Database:
    db = sqlite_utils.Database(settings.database_path)

    # ── Users table ─────────────────────────────────────────
    if "users" not in db.table_names():
        db["users"].create({
            "id": int,
            "name": str,
            "email": str,
            "phone": str,
            "password_hash": str,
            "created_at": str,
            "is_active": int,
        }, pk="id", if_not_exists=True)
        db["users"].create_index(["email"], unique=True, if_not_exists=True)
        db["users"].create_index(["phone"], unique=True, if_not_exists=True)
        logger.info("Created 'users' table")

    # ── Emergency contacts table ─────────────────────────────
    if "emergency_contacts" not in db.table_names():
        db["emergency_contacts"].create({
            "id": int,
            "user_id": int,
            "name": str,
            "phone": str,
            "relation": str,
            "created_at": str,
        }, pk="id", if_not_exists=True)
        logger.info("Created 'emergency_contacts' table")

    # ── Refresh tokens table ─────────────────────────────────
    if "refresh_tokens" not in db.table_names():
        db["refresh_tokens"].create({
            "id": int,
            "user_id": int,
            "token": str,
            "expires_at": str,
            "revoked": int,
        }, pk="id", if_not_exists=True)
        logger.info("Created 'refresh_tokens' table")

    # ── Analyses table (with optional user_id) ───────────────
    if "analyses" not in db.table_names():
        db["analyses"].create({
            "id": int,
            "user_id": int,       # 0 = guest
            "timestamp": str,
            "risk_score": int,
            "status": str,
            "scam_type": str,
            "transcript_preview": str,
            "is_demo": int,
        }, pk="id", if_not_exists=True)
        logger.info("Created 'analyses' table")
    else:
        # Migrate: add user_id column if missing
        try:
            cols = [c.name for c in db["analyses"].columns]
            if "user_id" not in cols:
                db["analyses"].add_column("user_id", int, not_null_default=0)
                logger.info("Migrated 'analyses' table: added user_id column")
        except Exception as e:
            logger.warning(f"Migration check failed: {e}")

    return db

