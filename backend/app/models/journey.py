import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    JSON,
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class SpiritualJourney(Base):
    __tablename__ = "spiritual_journeys"
    __table_args__ = (
        CheckConstraint(
            "level IN ('beginner','intermediate','advanced')", name="ck_journey_level"
        ),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    spiritual_axis: Mapped[str] = mapped_column(String(20), nullable=False)
    objective: Mapped[str | None] = mapped_column(Text)
    total_days: Mapped[int] = mapped_column(Integer, nullable=False)
    level: Mapped[str] = mapped_column(String(20), default="beginner")
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    steps: Mapped[list["JourneyStep"]] = relationship(
        back_populates="journey", cascade="all, delete-orphan", order_by="JourneyStep.day_number"
    )


class JourneyStep(Base):
    __tablename__ = "journey_steps"
    __table_args__ = (UniqueConstraint("journey_id", "day_number", name="uq_journey_day"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    journey_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("spiritual_journeys.id", ondelete="CASCADE"), nullable=False
    )
    day_number: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    content_item_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("content_items.id"))
    image_asset_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("image_assets.id"))
    contemplation_text: Mapped[str | None] = mapped_column(Text)
    breathing_pattern: Mapped[str | None] = mapped_column(String(20))  # ex.: "4-7-8"
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    journey: Mapped[SpiritualJourney] = relationship(back_populates="steps")


class UserJourneyProgress(Base):
    __tablename__ = "user_journey_progress"
    __table_args__ = (UniqueConstraint("user_id", "journey_id", name="uq_user_journey"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    journey_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("spiritual_journeys.id", ondelete="CASCADE"), nullable=False
    )
    current_day: Mapped[int] = mapped_column(Integer, default=1)
    completed_days: Mapped[list] = mapped_column(JSON, default=list)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)
