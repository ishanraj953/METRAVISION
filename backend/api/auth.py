from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.connection import get_db
from models.user import User, UserRole
from schemas.auth import LoginRequest, TokenResponse
from schemas.user import UserCreate, UserResponse, ProfileUpdateRequest
from auth.jwt import verify_password, get_password_hash, create_access_token
from auth.dependencies import get_current_user
from utils.audit_logger import log_audit

router = APIRouter(prefix="/auth", tags=["Authentication"])

BADGE_MAP = {
    "ADM-902": "admin@metrax.gov.in",
    "CHK-109": "checker@metrax.gov.in",
    "SHP-401": "shopkeeper@metrax.com",
}

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    clean_email = user_in.email.strip().lower()
    if not clean_email or "@" not in clean_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please enter a valid official email address.")
    if len(user_in.password.strip()) < 6:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 6 characters.")
    if not user_in.full_name.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Full name is required.")

    existing = db.query(User).filter(User.email == clean_email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="An account with this email address is already registered.")

    hashed_pw = get_password_hash(user_in.password)
    new_user = User(
        email=clean_email,
        hashed_password=hashed_pw,
        full_name=user_in.full_name.strip(),
        role=user_in.role or UserRole.SHOPKEEPER,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    log_audit(db, action="REGISTER", entity="User", entity_id=str(new_user.id), user=new_user)

    token = create_access_token({"sub": str(new_user.id), "email": new_user.email, "role": new_user.role.value})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=new_user.id,
        email=new_user.email,
        role=new_user.role,
        full_name=new_user.full_name
    )

@router.post("/login", response_model=TokenResponse)
def login(login_req: LoginRequest, db: Session = Depends(get_db)):
    req_email = login_req.email.strip().lower()
    # Support official badge shorthand
    for badge_code, target_email in BADGE_MAP.items():
        if req_email.upper() == badge_code:
            req_email = target_email
            break

    user = db.query(User).filter(User.email == req_email).first()
    if not user or not verify_password(login_req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid official credentials. Please check your email/badge ID and password."
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive or suspended user account.")

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role.value})
    
    log_audit(db, action="LOGIN", entity="User", entity_id=str(user.id), user=user)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        role=user.role,
        full_name=user.full_name
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(
    profile_in: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if profile_in.full_name and profile_in.full_name.strip():
        current_user.full_name = profile_in.full_name.strip()

    if profile_in.email and profile_in.email.strip():
        new_email = profile_in.email.strip().lower()
        if new_email != current_user.email:
            existing = db.query(User).filter(User.email == new_email).first()
            if existing:
                raise HTTPException(status_code=400, detail="Email already taken by another account.")
            current_user.email = new_email

    if profile_in.new_password:
        if not profile_in.current_password or not verify_password(profile_in.current_password, current_user.hashed_password):
            raise HTTPException(status_code=400, detail="Current password incorrect.")
        if len(profile_in.new_password.strip()) < 6:
            raise HTTPException(status_code=400, detail="New password must be at least 6 characters.")
        current_user.hashed_password = get_password_hash(profile_in.new_password)

    db.commit()
    db.refresh(current_user)
    log_audit(db, action="UPDATE_PROFILE", entity="User", entity_id=str(current_user.id), user=current_user)
    return current_user

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    log_audit(db, action="LOGOUT", entity="User", entity_id=str(current_user.id), user=current_user)
    return {"message": "Successfully logged out"}
