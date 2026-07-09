import hashlib
import secrets
from datetime import datetime, timedelta, timezone

import jwt

from .config import settings

_PBKDF2_ITERATIONS = 200_000


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode(), salt.encode(), _PBKDF2_ITERATIONS
    ).hex()
    return f"pbkdf2_sha256${_PBKDF2_ITERATIONS}${salt}${digest}"


def verify_password(password: str, stored: str) -> bool:
    try:
        _, iterations, salt, digest = stored.split("$")
    except ValueError:
        return False
    candidate = hashlib.pbkdf2_hmac(
        "sha256", password.encode(), salt.encode(), int(iterations)
    ).hex()
    return secrets.compare_digest(candidate, digest)


def _create_token(user_id: str, token_type: str, lifetime: timedelta) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "type": token_type,
        "iat": now,
        "exp": now + lifetime,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def create_access_token(user_id: str) -> str:
    return _create_token(user_id, "access", timedelta(minutes=settings.access_token_minutes))


def create_refresh_token(user_id: str) -> str:
    return _create_token(user_id, "refresh", timedelta(days=settings.refresh_token_days))


def decode_token(token: str, expected_type: str) -> str | None:
    """Retorna o user_id se o token for válido e do tipo esperado."""
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except jwt.PyJWTError:
        return None
    if payload.get("type") != expected_type:
        return None
    return payload.get("sub")
