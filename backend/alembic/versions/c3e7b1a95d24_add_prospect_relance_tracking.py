"""add prospect relance channel/status tracking

Revision ID: c3e7b1a95d24
Revises: a9d3f7c15e64
Create Date: 2026-09-15 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'c3e7b1a95d24'
down_revision: Union[str, None] = 'a9d3f7c15e64'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('prospects', sa.Column('last_relance_channel', sa.String(), nullable=True))
    op.add_column('prospects', sa.Column('last_relance_status', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('prospects', 'last_relance_status')
    op.drop_column('prospects', 'last_relance_channel')
