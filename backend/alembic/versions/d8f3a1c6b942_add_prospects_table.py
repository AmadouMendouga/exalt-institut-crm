"""add prospects table

Revision ID: d8f3a1c6b942
Revises: c1f4a7e60d38
Create Date: 2026-09-08 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd8f3a1c6b942'
down_revision: Union[str, None] = 'bb51a3ea4f12'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'prospects',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('phone', sa.String(), nullable=False),
        sa.Column('prospected_date', sa.String(), nullable=False),
        sa.Column('source', sa.String(), nullable=True),
        sa.Column('notes', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=False, server_default='new'),
        sa.Column('last_relance_at', sa.DateTime(), nullable=True),
        sa.Column('converted_client_id', sa.String(), sa.ForeignKey('clients.id'), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table('prospects')
