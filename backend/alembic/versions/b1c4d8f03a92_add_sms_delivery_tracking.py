"""add sms delivery tracking columns

Revision ID: b1c4d8f03a92
Revises: e109b4cd1201
Create Date: 2026-09-20 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b1c4d8f03a92'
down_revision: Union[str, None] = 'e109b4cd1201'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('timeline_items', sa.Column('gateway_message_id', sa.String(), nullable=True))
    op.add_column('timeline_items', sa.Column('delivery_status', sa.String(), nullable=True))
    op.add_column('timeline_items', sa.Column('delivery_detail', sa.String(), nullable=True))
    op.add_column('prospects', sa.Column('gateway_message_id', sa.String(), nullable=True))
    op.add_column('prospects', sa.Column('delivery_detail', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('prospects', 'delivery_detail')
    op.drop_column('prospects', 'gateway_message_id')
    op.drop_column('timeline_items', 'delivery_detail')
    op.drop_column('timeline_items', 'delivery_status')
    op.drop_column('timeline_items', 'gateway_message_id')
