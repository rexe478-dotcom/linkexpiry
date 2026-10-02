"""Initial messages table

Revision ID: 001_initial_messages
Revises: 
Create Date: 2026-10-02 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001_initial_messages'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'messages',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('token', sa.String(length=64), nullable=False),
        sa.Column('encrypted_message', sa.Text(), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('viewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_messages_token'), 'messages', ['token'], unique=True)
    op.create_index(op.f('ix_messages_expires_at'), 'messages', ['expires_at'], unique=False)
    op.create_index(op.f('ix_messages_viewed_at'), 'messages', ['viewed_at'], unique=False)
    op.create_index(
        'ix_messages_token_viewed_expires',
        'messages',
        ['token', 'viewed_at', 'expires_at'],
        unique=False
    )


def downgrade() -> None:
    op.drop_index('ix_messages_token_viewed_expires', table_name='messages')
    op.drop_index(op.f('ix_messages_viewed_at'), table_name='messages')
    op.drop_index(op.f('ix_messages_expires_at'), table_name='messages')
    op.drop_index(op.f('ix_messages_token'), table_name='messages')
    op.drop_table('messages')
