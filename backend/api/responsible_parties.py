from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from database.connection import get_db
from models.responsible_party import ResponsibleParty
from models.user import User
from schemas.responsible_party import (
    ResponsiblePartyCreate,
    ResponsiblePartyUpdate,
    ResponsiblePartyResponse,
    ResponsiblePartyListResponse
)
from auth.dependencies import get_current_user

router = APIRouter(prefix="/responsible-parties", tags=["Responsible Parties Directory"])

@router.get("/stats")
def get_party_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total = db.query(func.count(ResponsibleParty.id)).scalar() or 0
    active = db.query(func.count(ResponsibleParty.id)).filter(ResponsibleParty.status == "ACTIVE").scalar() or 0
    repeat_offenders = db.query(func.count(ResponsibleParty.id)).filter(ResponsibleParty.total_violations > 1).scalar() or 0
    total_penalties = db.query(func.sum(ResponsibleParty.total_penalties)).scalar() or 0.0

    entity_keys = ["MANUFACTURER", "PACKER", "IMPORTER", "BRAND_OWNER", "SELLER_DEALER", "ECOMMERCE_ENTITY"]
    by_type = {}
    for ek in entity_keys:
        cnt = db.query(func.count(ResponsibleParty.id)).filter(ResponsibleParty.entity_type == ek).scalar() or 0
        by_type[ek] = cnt

    return {
        "total_entities": total,
        "active_entities": active,
        "repeat_offenders": repeat_offenders,
        "total_penalties_collected": float(total_penalties),
        "by_type": by_type
    }

@router.get("", response_model=ResponsiblePartyListResponse)
def list_responsible_parties(
    entity_type: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ResponsibleParty)

    if entity_type:
        query = query.filter(ResponsibleParty.entity_type == entity_type)
    if status:
        query = query.filter(ResponsibleParty.status == status)
    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(
            (ResponsibleParty.name.ilike(pattern)) |
            (ResponsibleParty.brand_name.ilike(pattern)) |
            (ResponsibleParty.registration_number.ilike(pattern)) |
            (ResponsibleParty.address.ilike(pattern))
        )

    total = query.count()
    parties = query.order_by(ResponsibleParty.total_violations.desc(), ResponsibleParty.name.asc()).offset((page - 1) * limit).limit(limit).all()

    return {
        "items": parties,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit if limit else 1
    }

@router.get("/{party_id}", response_model=ResponsiblePartyResponse)
def get_party_detail(
    party_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    party = db.query(ResponsibleParty).filter(ResponsibleParty.id == party_id).first()
    if not party:
        raise HTTPException(status_code=404, detail=f"Responsible party {party_id} not found")
    return party

@router.post("", response_model=ResponsiblePartyResponse)
def create_responsible_party(
    req: ResponsiblePartyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(ResponsibleParty).filter(ResponsibleParty.name.ilike(req.name.strip())).first()
    if existing:
        raise HTTPException(status_code=400, detail="An entity with this name is already registered")

    party = ResponsibleParty(
        name=req.name.strip(),
        entity_type=req.entity_type,
        brand_name=req.brand_name,
        registration_number=req.registration_number,
        address=req.address,
        city=req.city,
        state=req.state,
        pincode=req.pincode,
        contact_person=req.contact_person,
        email=req.email,
        phone=req.phone,
        status="ACTIVE"
    )
    db.add(party)
    db.commit()
    db.refresh(party)
    return party

@router.put("/{party_id}", response_model=ResponsiblePartyResponse)
def update_responsible_party(
    party_id: int,
    req: ResponsiblePartyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    party = db.query(ResponsibleParty).filter(ResponsibleParty.id == party_id).first()
    if not party:
        raise HTTPException(status_code=404, detail=f"Party {party_id} not found")

    update_data = req.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(party, k, v)

    db.commit()
    db.refresh(party)
    return party
