from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.message import (
    MessageCreate,
    MessageCreateResponse,
    MessageStatusResponse,
    MessageRevealResponse,
)
from app.services.message_service import MessageService

router = APIRouter(prefix="/messages", tags=["messages"])


@router.post("", response_model=MessageCreateResponse, status_code=201)
async def create_message(
    payload: MessageCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new temporary message.
    Returns the public token and unique shareable link.
    """
    base_url = str(request.base_url).rstrip("/")
    # Check if request has an Origin or Referer header to construct frontend URL
    origin = request.headers.get("origin")
    return await MessageService.create_message(
        db=db,
        data=payload,
        base_url=origin or base_url,
    )


@router.get("/{token}", response_model=MessageStatusResponse)
async def get_message_status(
    token: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Check the status of a message by token without revealing the plaintext.
    Possible states: available, expired, viewed, not_found.
    """
    return await MessageService.get_message_status(db=db, token=token)


@router.post("/{token}/reveal", response_model=MessageRevealResponse)
async def reveal_message(
    token: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Atomically reveal a message once.
    Marks viewed_at timestamp immediately.
    Subsequent requests will be rejected.
    """
    return await MessageService.reveal_message(db=db, token=token)
