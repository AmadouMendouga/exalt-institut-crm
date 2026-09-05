"""add gender to birthday_submissions

Revision ID: bb51a3ea4f12
Revises: d76874f18420
Create Date: 2026-09-05 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'bb51a3ea4f12'
down_revision: Union[str, None] = 'd76874f18420'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'birthday_submissions',
        sa.Column('gender', sa.String(), nullable=False, server_default='F'),
    )
    op.alter_column('birthday_submissions', 'gender', server_default=None)


def downgrade() -> None:
    op.drop_column('birthday_submissions', 'gender')
