from fastapi import APIRouter, HTTPException, Depends, status
from models.auth_schemas import (
    RegisterRequest, LoginRequest, RefreshRequest,
    TokenResponse, UserOut, ContactRequest, ContactOut,
)
from services.auth_service import (
    create_user, authenticate_user,
    create_access_token, create_refresh_token,
    save_refresh_token, revoke_refresh_token, is_refresh_token_valid,
    decode_token, get_user_by_id,
    get_contacts, add_contact, delete_contact,
)
from dependencies import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["auth"])


def _user_to_out(user: dict) -> UserOut:
    return UserOut(
        id=user["id"],
        name=user["name"],
        email=user.get("email") or None,
        phone=user.get("phone") or None,
        created_at=user["created_at"],
    )


# ── Register ──────────────────────────────────────────────────────────────────
@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(req: RegisterRequest):
    try:
        user = create_user(req.name, req.email, req.phone, req.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Register error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed. Please try again.")

    access = create_access_token(user["id"], user.get("email"))
    refresh = create_refresh_token(user["id"])
    save_refresh_token(user["id"], refresh)

    return TokenResponse(
        access_token=access,
        refresh_token=refresh,
        user=_user_to_out(user),
    )


# ── Login ─────────────────────────────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    user = authenticate_user(req.identifier.strip(), req.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please check your email/phone and password.",
        )

    access = create_access_token(user["id"], user.get("email"))
    refresh = create_refresh_token(user["id"])
    save_refresh_token(user["id"], refresh)

    return TokenResponse(
        access_token=access,
        refresh_token=refresh,
        user=_user_to_out(user),
    )


# ── Refresh ───────────────────────────────────────────────────────────────────
@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(req: RefreshRequest):
    payload = decode_token(req.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token.")

    user_id = int(payload["sub"])
    if not is_refresh_token_valid(req.refresh_token, user_id):
        raise HTTPException(status_code=401, detail="Refresh token expired or revoked. Please log in again.")

    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found.")

    # Rotate tokens
    revoke_refresh_token(req.refresh_token)
    new_access = create_access_token(user["id"], user.get("email"))
    new_refresh = create_refresh_token(user["id"])
    save_refresh_token(user["id"], new_refresh)

    return TokenResponse(
        access_token=new_access,
        refresh_token=new_refresh,
        user=_user_to_out(user),
    )


# ── Me ────────────────────────────────────────────────────────────────────────
@router.get("/me", response_model=UserOut)
async def get_me(current_user: dict = Depends(get_current_user)):
    return _user_to_out(current_user)


# ── Logout ────────────────────────────────────────────────────────────────────
@router.post("/logout")
async def logout(req: RefreshRequest, current_user: dict = Depends(get_current_user)):
    revoke_refresh_token(req.refresh_token)
    return {"message": "Logged out successfully."}


# ── Emergency Contacts ────────────────────────────────────────────────────────
@router.get("/contacts", response_model=list[ContactOut])
async def list_contacts(current_user: dict = Depends(get_current_user)):
    contacts = get_contacts(current_user["id"])
    return [ContactOut(**c) for c in contacts]


@router.post("/contacts", response_model=ContactOut, status_code=201)
async def create_contact(
    req: ContactRequest,
    current_user: dict = Depends(get_current_user),
):
    try:
        contact = add_contact(current_user["id"], req.name, req.phone, req.relation)
        return ContactOut(**contact)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/contacts/{contact_id}")
async def remove_contact(
    contact_id: int,
    current_user: dict = Depends(get_current_user),
):
    ok = delete_contact(contact_id, current_user["id"])
    if not ok:
        raise HTTPException(status_code=404, detail="Contact not found.")
    return {"message": "Contact removed."}

