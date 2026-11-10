import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from models.user import get_db

logger = logging.getLogger(__name__)

# ── Config ───────────────────────────────────────────────────────────────────
SECRET_KEY = "suraksha-call-secret-key-change-in-production-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24       # 24 hours
REFRESH_TOKEN_EXPIRE_DAYS = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ── Password utilities ────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ── JWT utilities ─────────────────────────────────────────────────────────────

def _now_utc():
    return datetime.now(timezone.utc)


def create_access_token(user_id: int, email: str = None) -> str:
    expire = _now_utc() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "email": email or "",
        "type": "access",
        "exp": expire,
        "iat": _now_utc(),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(user_id: int) -> str:
    expire = _now_utc() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": str(user_id),
        "type": "refresh",
        "exp": expire,
        "iat": _now_utc(),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


# ── User CRUD ─────────────────────────────────────────────────────────────────

def get_user_by_id(user_id: int) -> Optional[dict]:
    try:
        db = get_db()
        rows = list(db["users"].rows_where("id = ?", [user_id]))
        return rows[0] if rows else None
    except Exception as e:
        logger.error(f"get_user_by_id error: {e}")
        return None


def get_user_by_identifier(identifier: str) -> Optional[dict]:
    """Find user by email or phone."""
    try:
        db = get_db()
        rows = list(db["users"].rows_where("email = ? OR phone = ?", [identifier, identifier]))
        return rows[0] if rows else None
    except Exception as e:
        logger.error(f"get_user_by_identifier error: {e}")
        return None


def create_user(name: str, email: Optional[str], phone: Optional[str], password: str) -> dict:
    db = get_db()

    # Check duplicate
    if email:
        existing = list(db["users"].rows_where("email = ?", [email]))
        if existing:
            raise ValueError("Email already registered")
    if phone:
        existing = list(db["users"].rows_where("phone = ?", [phone]))
        if existing:
            raise ValueError("Phone number already registered")

    now = datetime.utcnow().isoformat()
    row = {
        "name": name.strip(),
        "email": email or "",
        "phone": phone or "",
        "password_hash": hash_password(password),
        "created_at": now,
        "is_active": 1,
    }
    db["users"].insert(row)
    new_id = db.execute("SELECT last_insert_rowid()").fetchone()[0]
    return get_user_by_id(new_id)


def authenticate_user(identifier: str, password: str) -> Optional[dict]:
    user = get_user_by_identifier(identifier)
    if not user:
        return None
    if not verify_password(password, user["password_hash"]):
        return None
    if not user.get("is_active", 1):
        return None
    return user


def save_refresh_token(user_id: int, token: str):
    try:
        db = get_db()
        expire = (datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)).isoformat()
        db["refresh_tokens"].insert({
            "user_id": user_id,
            "token": token,
            "expires_at": expire,
            "revoked": 0,
        })
    except Exception as e:
        logger.error(f"save_refresh_token error: {e}")


def revoke_refresh_token(token: str):
    try:
        db = get_db()
        db["refresh_tokens"].update_where("token = ?", [token], {"revoked": 1})
    except Exception as e:
        logger.error(f"revoke_refresh_token error: {e}")


def is_refresh_token_valid(token: str, user_id: int) -> bool:
    try:
        db = get_db()
        rows = list(db["refresh_tokens"].rows_where(
            "token = ? AND user_id = ? AND revoked = 0", [token, user_id]
        ))
        if not rows:
            return False
        row = rows[0]
        expires_at = datetime.fromisoformat(row["expires_at"])
        return datetime.utcnow() < expires_at
    except Exception as e:
        logger.error(f"is_refresh_token_valid error: {e}")
        return False


# ── Emergency contacts CRUD ───────────────────────────────────────────────────

def get_contacts(user_id: int) -> list:
    try:
        db = get_db()
        return list(db["emergency_contacts"].rows_where("user_id = ?", [user_id]))
    except Exception as e:
        logger.error(f"get_contacts error: {e}")
        return []


def add_contact(user_id: int, name: str, phone: str, relation: str) -> dict:
    db = get_db()
    db["emergency_contacts"].insert({
        "user_id": user_id,
        "name": name.strip(),
        "phone": phone.strip(),
        "relation": relation.strip(),
        "created_at": datetime.utcnow().isoformat(),
    })
    new_id = db.execute("SELECT last_insert_rowid()").fetchone()[0]
    return list(db["emergency_contacts"].rows_where("id = ?", [new_id]))[0]


def delete_contact(contact_id: int, user_id: int) -> bool:
    try:
        db = get_db()
        rows = list(db["emergency_contacts"].rows_where(
            "id = ? AND user_id = ?", [contact_id, user_id]
        ))
        if not rows:
            return False
        db["emergency_contacts"].delete_where("id = ?", [contact_id])
        return True
    except Exception as e:
        logger.error(f"delete_contact error: {e}")
        return False

