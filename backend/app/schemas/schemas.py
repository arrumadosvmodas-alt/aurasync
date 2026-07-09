from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from ..core.constants import CONTENT_TYPES, EXPERIENCE_LEVELS, GOALS


# ---------- Auth ----------

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    display_name: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: str
    email: str
    display_name: str | None
    role: str
    is_active: bool

    model_config = {"from_attributes": True}


class UserAdminOut(BaseModel):
    id: str
    email: str
    display_name: str | None
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserPatch(BaseModel):
    role: str | None = None
    is_active: bool | None = None

    def validate_domain(self) -> "UserPatch":
        if self.role is not None and self.role not in ("user", "admin"):
            raise ValueError("role deve ser 'user' ou 'admin'")
        return self


# ---------- Onboarding / preferências ----------

class OnboardingRequest(BaseModel):
    primary_goal: str = Field(default="relaxation")
    preferred_duration_seconds: int = Field(default=600, ge=60, le=7200)
    preferred_content: list[str] = []
    spiritual_axis: list[str] = []
    experience_level: str = "beginner"

    def validate_domain(self) -> "OnboardingRequest":
        if self.primary_goal not in GOALS:
            raise ValueError(f"primary_goal deve ser um de {GOALS}")
        if self.experience_level not in EXPERIENCE_LEVELS:
            raise ValueError(f"experience_level deve ser um de {EXPERIENCE_LEVELS}")
        return self


class PreferencesOut(BaseModel):
    primary_goal: str
    preferred_duration_seconds: int
    preferred_content: list
    spiritual_axis: list
    experience_level: str

    model_config = {"from_attributes": True}


# ---------- Catálogo ----------

class BinauralParamsOut(BaseModel):
    left_hz: float
    right_hz: float
    beat_hz: float
    base_noise: str
    ambience: str | None

    model_config = {"from_attributes": True}


class AudioAssetOut(BaseModel):
    id: str
    url: str
    format: str
    sample_rate: int | None
    channels: int | None
    is_loopable: bool


class ImageAssetOut(BaseModel):
    id: str
    title: str
    url: str | None
    colors: list
    visual_tags: list
    spiritual_axis: list
    attribution: str | None = None


class ContentItemOut(BaseModel):
    id: str
    title: str
    description: str | None
    type: str
    spiritual_axis: list
    mood_tags: list
    duration_seconds: int | None
    energy_level: int
    is_premium: bool
    is_active: bool
    published_at: datetime | None
    cover_image: ImageAssetOut | None = None
    audio: list[AudioAssetOut] = []
    binaural: BinauralParamsOut | None = None
    attributions: list[str] = []


class RecommendationOut(BaseModel):
    item: ContentItemOut
    score: float
    reasons: list[str]


# ---------- Jornadas ----------

class JourneyStepOut(BaseModel):
    id: str
    day_number: int
    title: str
    content_item_id: str | None
    image_asset_id: str | None
    contemplation_text: str | None
    breathing_pattern: str | None

    model_config = {"from_attributes": True}


class JourneyOut(BaseModel):
    id: str
    title: str
    description: str | None
    spiritual_axis: str
    objective: str | None
    total_days: int
    level: str
    is_premium: bool
    steps: list[JourneyStepOut] = []

    model_config = {"from_attributes": True}


class JourneyProgressIn(BaseModel):
    completed_day: int = Field(ge=1)


class JourneyProgressOut(BaseModel):
    journey_id: str
    current_day: int
    completed_days: list

    model_config = {"from_attributes": True}


# ---------- Histórico / favoritos ----------

class HistoryIn(BaseModel):
    content_item_id: str
    seconds_played: int = 0
    completed: bool = False


class FavoriteIn(BaseModel):
    content_item_id: str


# ---------- Admin (CMS) ----------

class LicenseIn(BaseModel):
    asset_type: str
    asset_id: str
    source_name: str
    source_url: str | None = None
    author_name: str | None = None
    license_name: str
    license_url: str | None = None
    attribution_required: bool = False
    attribution_text: str | None = None
    commercial_use_allowed: bool = True
    derivative_allowed: bool = True


class AudioAssetIn(BaseModel):
    storage_path: str
    format: str = "wav"
    sample_rate: int | None = None
    channels: int | None = None
    bpm: float | None = None
    is_loopable: bool = False


class ContentItemIn(BaseModel):
    title: str
    description: str | None = None
    type: str
    spiritual_axis: list[str] = []
    mood_tags: list[str] = []
    duration_seconds: int | None = None
    energy_level: int = 2
    is_premium: bool = False

    def validate_domain(self) -> "ContentItemIn":
        if self.type not in CONTENT_TYPES:
            raise ValueError(f"type deve ser um de {CONTENT_TYPES}")
        return self


class ContentItemPatch(BaseModel):
    title: str | None = None
    description: str | None = None
    spiritual_axis: list[str] | None = None
    mood_tags: list[str] | None = None
    duration_seconds: int | None = None
    energy_level: int | None = None
    is_premium: bool | None = None
    is_active: bool | None = None
