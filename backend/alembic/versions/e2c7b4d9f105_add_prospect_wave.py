"""add wave field to prospects

Revision ID: e2c7b4d9f105
Revises: d8f3a1c6b942
Create Date: 2026-09-08 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e2c7b4d9f105'
down_revision: Union[str, None] = 'd8f3a1c6b942'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('prospects', sa.Column('wave', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('prospects', 'wave')
