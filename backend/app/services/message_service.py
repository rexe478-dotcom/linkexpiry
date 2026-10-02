import asyncio
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.core.config import settings
from app.core.security import generate_secure_token, encrypt_message, decrypt_message
from app.db.models import Message
from app.schemas.message import (
    MessageCreate,
    MessageCreateResponse,
    MessageStatusResponse,
    MessageRevealResponse,
)


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


# In-memory store fallback with concurrency lock for zero-dependency / fallback execution
_memory_store: Dict[str, Dict[str, Any]] = {}
_memory_lock = asyncio.Lock()


class MessageService:
    @staticmethod
    async def create_message(
        db: Optional[AsyncSession],
        data: MessageCreate,
        base_url: str | None = None
    ) -> MessageCreateResponse:
        now = get_utc_now()
        expires_at = now + timedelta(minutes=data.expiration_minutes)
        token = generate_secure_token(16)

        encrypted_content = encrypt_message(data.message)

        if db is not None:
            db_message = Message(
                token=token,
                encrypted_message=encrypted_content,
                expires_at=expires_at,
                created_at=now,
                viewed_at=None,
            )
            db.add(db_message)
            await db.commit()
            await db.refresh(db_message)
        else:
            async with _memory_lock:
                _memory_store[token] = {
                    "id": token,
                    "token": token,
                    "encrypted_message": encrypted_content,
                    "expires_at": expires_at,
                    "created_at": now,
                    "viewed_at": None,
                }

        app_base = (base_url or settings.base_url or settings.frontend_origin).rstrip("/")
        share_url = f"{app_base}/{token}"

        return MessageCreateResponse(
            token=token,
            expires_at=expires_at,
            url=share_url,
        )

    @staticmethod
    async def get_message_status(
        db: Optional[AsyncSession],
        token: str
    ) -> MessageStatusResponse:
        now = get_utc_now()

        if db is not None:
            query = select(Message).where(Message.token == token)
            result = await db.execute(query)
            msg = result.scalar_one_or_none()

            if not msg:
                return MessageStatusResponse(status="not_found")

            if msg.viewed_at is not None:
                return MessageStatusResponse(
                    status="viewed",
                    expires_at=msg.expires_at,
                    created_at=msg.created_at,
                )

            msg_expires_at = msg.expires_at
            if msg_expires_at.tzinfo is None:
                msg_expires_at = msg_expires_at.replace(tzinfo=timezone.utc)

            if now >= msg_expires_at:
                return MessageStatusResponse(
                    status="expired",
                    expires_at=msg.expires_at,
                    created_at=msg.created_at,
                )

            return MessageStatusResponse(
                status="available",
                expires_at=msg.expires_at,
                created_at=msg.created_at,
            )
        else:
            async with _memory_lock:
                item = _memory_store.get(token)
                if not item:
                    return MessageStatusResponse(status="not_found")

                if item["viewed_at"] is not None:
                    return MessageStatusResponse(
                        status="viewed",
                        expires_at=item["expires_at"],
                        created_at=item["created_at"],
                    )

                if now >= item["expires_at"]:
                    return MessageStatusResponse(
                        status="expired",
                        expires_at=item["expires_at"],
                        created_at=item["created_at"],
                    )

                return MessageStatusResponse(
                    status="available",
                    expires_at=item["expires_at"],
                    created_at=item["created_at"],
                )

    @staticmethod
    async def reveal_message(
        db: Optional[AsyncSession],
        token: str
    ) -> MessageRevealResponse:
        now = get_utc_now()

        if db is not None:
            # Atomic conditional update
            stmt = (
                update(Message)
                .where(
                    Message.token == token,
                    Message.viewed_at.is_(None),
                    Message.expires_at > now,
                )
                .values(viewed_at=now)
                .returning(
                    Message.encrypted_message,
                    Message.expires_at,
                    Message.viewed_at,
                )
            )

            result = await db.execute(stmt)
            row = result.fetchone()

            if row:
                await db.commit()
                encrypted_payload, expires_at, viewed_at = row
                try:
                    plaintext = decrypt_message(encrypted_payload)
                except Exception as e:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Failed to decrypt message content.",
                    ) from e

                return MessageRevealResponse(
                    message=plaintext,
                    viewed_at=viewed_at or now,
                    expires_at=expires_at,
                )

            await db.rollback()
            query = select(Message).where(Message.token == token)
            res = await db.execute(query)
            msg = res.scalar_one_or_none()

            if not msg:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Message not found",
                )

            msg_expires_at = msg.expires_at
            if msg_expires_at.tzinfo is None:
                msg_expires_at = msg_expires_at.replace(tzinfo=timezone.utc)

            if now >= msg_expires_at:
                raise HTTPException(
                    status_code=status.HTTP_410_GONE,
                    detail="This message has expired",
                )

            if msg.viewed_at is not None:
                raise HTTPException(
                    status_code=status.HTTP_410_GONE,
                    detail="This message has already been viewed",
                )

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message cannot be revealed",
            )
        else:
            # In-memory atomic reveal with asyncio lock
            async with _memory_lock:
                item = _memory_store.get(token)
                if not item:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Message not found",
                    )

                if now >= item["expires_at"]:
                    raise HTTPException(
                        status_code=status.HTTP_410_GONE,
                        detail="This message has expired",
                    )

                if item["viewed_at"] is not None:
                    raise HTTPException(
                        status_code=status.HTTP_410_GONE,
                        detail="This message has already been viewed",
                    )

                # Atomically mark as viewed
                item["viewed_at"] = now
                encrypted_payload = item["encrypted_message"]
                expires_at = item["expires_at"]
                viewed_at = item["viewed_at"]

            try:
                plaintext = decrypt_message(encrypted_payload)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to decrypt message content.",
                ) from e

            return MessageRevealResponse(
                message=plaintext,
                viewed_at=viewed_at,
                expires_at=expires_at,
            )
