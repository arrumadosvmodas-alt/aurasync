"""Catálogo de conteúdo, assets e licenças.

Correções sobre o plano original:
- `asset_licenses` é a fonte única de verdade de licenciamento (áudio E imagem);
  `image_assets` não duplica campos de licença.
- `audio_assets` ganhou vínculo de licença (via asset_licenses.asset_id).
- 'journey' saiu do enum de content_items (jornadas são agregados próprios).
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    JSON,
    Boolean,
    CheckConstraint,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class ContentItem(Base):
    __tablename__ = "content_items"
    __table_args__ = (
        CheckConstraint(
            "type IN ('music','meditation','soundscape','binaural','breathing')",
            name="ck_content_type",
        ),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    type: Mapped[str] = mapped_column(String(20), nullable=False)
    spiritual_axis: Mapped[list] = mapped_column(JSON, default=list)
    mood_tags: Mapped[list] = mapped_column(JSON, default=list)
    duration_seconds: Mapped[int | None] = mapped_column(Integer)
    language: Mapped[str] = mapped_column(String(10), default="pt-BR")
    energy_level: Mapped[int] = mapped_column(Integer, default=2)
    sleep_safe: Mapped[bool] = mapped_column(Boolean, default=True)
    meditation_safe: Mapped[bool] = mapped_column(Boolean, default=True)
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    cover_image_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("image_assets.id"))
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    audio_assets: Mapped[list["AudioAsset"]] = relationship(
        back_populates="content_item", cascade="all, delete-orphan"
    )
    binaural_params: Mapped["BinauralParams | None"] = relationship(
        back_populates="content_item", uselist=False, cascade="all, delete-orphan"
    )
    cover_image: Mapped["ImageAsset | None"] = relationship(foreign_keys=[cover_image_id])


class AudioAsset(Base):
    __tablename__ = "audio_assets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    content_item_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("content_items.id", ondelete="CASCADE"), nullable=False
    )
    storage_path: Mapped[str] = mapped_column(Text, nullable=False)  # relativo a storage/
    cdn_url: Mapped[str | None] = mapped_column(Text)
    format: Mapped[str] = mapped_column(String(10), nullable=False)
    bitrate: Mapped[int | None] = mapped_column(Integer)
    sample_rate: Mapped[int | None] = mapped_column(Integer)
    channels: Mapped[int | None] = mapped_column(Integer)
    loudness_lufs: Mapped[float | None] = mapped_column(Numeric)
    bpm: Mapped[float | None] = mapped_column(Numeric)
    is_loopable: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    content_item: Mapped[ContentItem] = relationship(back_populates="audio_assets")


class ImageAsset(Base):
    __tablename__ = "image_assets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    storage_path: Mapped[str | None] = mapped_column(Text)
    external_url: Mapped[str | None] = mapped_column(Text)
    cdn_url: Mapped[str | None] = mapped_column(Text)
    width: Mapped[int | None] = mapped_column(Integer)
    height: Mapped[int | None] = mapped_column(Integer)
    colors: Mapped[list] = mapped_column(JSON, default=list)
    visual_tags: Mapped[list] = mapped_column(JSON, default=list)
    spiritual_axis: Mapped[list] = mapped_column(JSON, default=list)
    visual_mood: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class AssetLicense(Base):
    """Fonte única de verdade de licenciamento — obrigatória para publicar."""

    __tablename__ = "asset_licenses"
    __table_args__ = (
        CheckConstraint("asset_type IN ('audio','image','video')", name="ck_license_asset_type"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    asset_type: Mapped[str] = mapped_column(String(10), nullable=False)
    asset_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    source_name: Mapped[str] = mapped_column(Text, nullable=False)
    source_url: Mapped[str | None] = mapped_column(Text)
    author_name: Mapped[str | None] = mapped_column(Text)
    license_name: Mapped[str] = mapped_column(Text, nullable=False)
    license_url: Mapped[str | None] = mapped_column(Text)
    attribution_required: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    attribution_text: Mapped[str | None] = mapped_column(Text)
    commercial_use_allowed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    derivative_allowed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class BinauralParams(Base):
    """Parâmetros técnicos de uma sessão binaural (experiência sonora, não médica)."""

    __tablename__ = "binaural_params"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    content_item_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("content_items.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    left_hz: Mapped[float] = mapped_column(Float, nullable=False)
    right_hz: Mapped[float] = mapped_column(Float, nullable=False)
    beat_hz: Mapped[float] = mapped_column(Float, nullable=False)
    base_noise: Mapped[str] = mapped_column(String(10), default="none")  # pink|brown|none
    ambience: Mapped[str | None] = mapped_column(Text)

    content_item: Mapped[ContentItem] = relationship(back_populates="binaural_params")


class Playlist(Base):
    __tablename__ = "playlists"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    items: Mapped[list["PlaylistItem"]] = relationship(
        back_populates="playlist", cascade="all, delete-orphan", order_by="PlaylistItem.position"
    )


class PlaylistItem(Base):
    __tablename__ = "playlist_items"

    playlist_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("playlists.id", ondelete="CASCADE"), primary_key=True
    )
    content_item_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("content_items.id", ondelete="CASCADE"), primary_key=True
    )
    position: Mapped[int] = mapped_column(Integer, default=0)

    playlist: Mapped[Playlist] = relationship(back_populates="items")
    content_item: Mapped[ContentItem] = relationship()
