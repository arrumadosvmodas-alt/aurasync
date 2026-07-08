"""CMS: CRUD de conteúdo com regra de licença obrigatória para publicar."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import require_admin_user
from app.api.serializers import serialize_content
from app.db import get_db
from app.models import AssetLicense, AudioAsset, ContentItem, User
from app.schemas.schemas import (
    AudioAssetIn,
    ContentItemIn,
    ContentItemOut,
    ContentItemPatch,
    LicenseIn,
    UserAdminOut,
    UserPatch,
)
from app.services.publishing import missing_licenses

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin_user)])


@router.get("/content", response_model=list[ContentItemOut])
def list_all_content(db: Session = Depends(get_db)):
    items = db.execute(select(ContentItem)).scalars().all()
    return [serialize_content(db, i) for i in items]


@router.post("/content", response_model=ContentItemOut, status_code=201)
def create_content(body: ContentItemIn, db: Session = Depends(get_db)):
    try:
        body.validate_domain()
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc
    item = ContentItem(**body.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return serialize_content(db, item)


@router.patch("/content/{item_id}", response_model=ContentItemOut)
def update_content(item_id: str, body: ContentItemPatch, db: Session = Depends(get_db)):
    item = db.get(ContentItem, item_id)
    if item is None:
        raise HTTPException(404, "Conteúdo não encontrado")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return serialize_content(db, item)


@router.post("/content/{item_id}/audio", status_code=201)
def add_audio_asset(item_id: str, body: AudioAssetIn, db: Session = Depends(get_db)):
    item = db.get(ContentItem, item_id)
    if item is None:
        raise HTTPException(404, "Conteúdo não encontrado")
    asset = AudioAsset(content_item_id=item_id, **body.model_dump())
    db.add(asset)
    db.commit()
    return {"id": asset.id}


@router.post("/licenses", status_code=201)
def register_license(body: LicenseIn, db: Session = Depends(get_db)):
    lic = AssetLicense(**body.model_dump(), verified_at=datetime.now(timezone.utc))
    db.add(lic)
    db.commit()
    return {"id": lic.id}


@router.post("/content/{item_id}/publish", response_model=ContentItemOut)
def publish_content(item_id: str, db: Session = Depends(get_db)):
    item = db.get(ContentItem, item_id)
    if item is None:
        raise HTTPException(404, "Conteúdo não encontrado")
    problems = missing_licenses(db, item)
    if problems:
        raise HTTPException(
            422,
            "Publicação bloqueada — pendências de licenciamento: " + "; ".join(problems),
        )
    item.published_at = datetime.now(timezone.utc)
    item.is_active = True
    db.commit()
    db.refresh(item)
    return serialize_content(db, item)


@router.post("/content/{item_id}/unpublish", response_model=ContentItemOut)
def unpublish_content(item_id: str, db: Session = Depends(get_db)):
    item = db.get(ContentItem, item_id)
    if item is None:
        raise HTTPException(404, "Conteúdo não encontrado")
    item.published_at = None
    db.commit()
    db.refresh(item)
    return serialize_content(db, item)


@router.get("/users", response_model=list[UserAdminOut])
def list_users(db: Session = Depends(get_db)):
    return db.execute(select(User).order_by(User.created_at.desc())).scalars().all()


@router.patch("/users/{user_id}", response_model=UserAdminOut)
def update_user(
    user_id: str,
    body: UserPatch,
    db: Session = Depends(get_db),
    current: User = Depends(require_admin_user),
):
    try:
        body.validate_domain()
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc

    target = db.get(User, user_id)
    if target is None:
        raise HTTPException(404, "Usuário não encontrado")

    if target.id == current.id:
        if body.role == "user":
            raise HTTPException(400, "Você não pode remover seu próprio acesso de administrador")
        if body.is_active is False:
            raise HTTPException(400, "Você não pode desativar a própria conta")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(target, field, value)
    db.commit()
    db.refresh(target)
    return target
