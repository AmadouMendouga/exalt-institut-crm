"""add client manual reminder fields (next_reminder_date, next_reminder_note)

Revision ID: c1a4d7f9b2e3
Revises: 9a3f2c6e5b41
Create Date: 2026-08-29 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c1a4d7f9b2e3'
down_revision: Union[str, None] = '9a3f2c6e5b41'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('clients', sa.Column('next_reminder_date', sa.String(), nullable=True))
    op.add_column('clients', sa.Column('next_reminder_note', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('clients', 'next_reminder_note')
    op.drop_column('clients', 'next_reminder_date')
