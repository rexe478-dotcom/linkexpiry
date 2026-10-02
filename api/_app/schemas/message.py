from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field, field_validator

SUPPORTED_EXPIRATION_MINUTES = {10, 60, 1440, 10080}
MAX_MESSAGE_LENGTH = 500


class MessageCreate(BaseModel):
    message: str = Field(..., description="The secret message content")
    expiration_minutes: int = Field(
        default=60,
        description="Expiration time in minutes (10, 60, 1440, 10080)"
    )

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Message cannot be empty")
        if len(trimmed) > MAX_MESSAGE_LENGTH:
            raise ValueError(f"Message exceeds maximum allowed length of {MAX_MESSAGE_LENGTH} characters")
        return trimmed

    @field_validator("expiration_minutes")
    @classmethod
    def validate_expiration(cls, v: int) -> int:
        if v not in SUPPORTED_EXPIRATION_MINUTES:
            raise ValueError(
                f"Invalid expiration period. Supported options are: {sorted(list(SUPPORTED_EXPIRATION_MINUTES))} minutes"
            )
        return v


class MessageCreateResponse(BaseModel):
    token: str
    expires_at: datetime
    url: str


class MessageStatusResponse(BaseModel):
    status: Literal["available", "expired", "viewed", "not_found"]
    expires_at: Optional[datetime] = None
    created_at: Optional[datetime] = None


class MessageRevealResponse(BaseModel):
    message: str
    viewed_at: datetime
    expires_at: datetime
