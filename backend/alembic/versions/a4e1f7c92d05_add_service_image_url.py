"""add image_url to services

Revision ID: a4e1f7c92d05
Revises: f2a9c6d51b83
Create Date: 2026-08-31 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a4e1f7c92d05'
down_revision: Union[str, None] = 'f2a9c6d51b83'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('services', sa.Column('image_url', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('services', 'image_url')
