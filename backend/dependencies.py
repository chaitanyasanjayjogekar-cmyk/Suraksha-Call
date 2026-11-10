from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from services.auth_service import decode_token, get_user_by_id
from typing import Optional

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
):
    """Strict: requires valid JWT. Raises 401 if missing or invalid."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_token(credentials.credentials)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = int(payload["sub"])
    user = get_user_by_id(user_id)
    if not user or not user.get("is_active", 1):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found or deactivated.",
        )
    return user


def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> Optional[dict]:
    """Optional: returns user dict if token valid, else None (guest mode)."""
    if not credentials:
        return None
    payload = decode_token(credentials.credentials)
    if not payload or payload.get("type") != "access":
        return None
    try:
        user_id = int(payload["sub"])
        return get_user_by_id(user_id)
    except Exception:
        return None

