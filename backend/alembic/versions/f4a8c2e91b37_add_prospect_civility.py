"""add civility field to prospects

Revision ID: f4a8c2e91b37
Revises: e2c7b4d9f105
Create Date: 2026-09-10 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f4a8c2e91b37'
down_revision: Union[str, None] = 'e2c7b4d9f105'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('prospects', sa.Column('civility', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('prospects', 'civility')
