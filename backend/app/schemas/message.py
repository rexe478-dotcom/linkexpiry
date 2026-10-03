from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field, field_validator

MAX_MESSAGE_LENGTH = 10000


class MessageCreate(BaseModel):
    message: str = Field(..., description="The secret message content")
    expiration_minutes: int = Field(
        default=60,
        description="Expiration time in minutes (1 to 43200)"
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
        if v < 1 or v > 43200:
            raise ValueError("Expiration must be between 1 minute and 43200 minutes (30 days)")
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
