import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Message(Base):
    __tablename__ = "messages"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        nullable=False,
    )
    token = Column(String(64), unique=True, index=True, nullable=False)
    encrypted_message = Column(Text, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    viewed_at = Column(DateTime(timezone=True), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    __table_args__ = (
        Index("ix_messages_token_viewed_expires", "token", "viewed_at", "expires_at"),
    )

    def __repr__(self) -> str:
        return f"<Message id={self.id} token={self.token} expires_at={self.expires_at} viewed={self.viewed_at is not None}>"
