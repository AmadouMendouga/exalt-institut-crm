"""add appointments and availability_rules

Revision ID: f2a9c6d51b83
Revises: e7b3a2c81f04
Create Date: 2026-08-31 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f2a9c6d51b83'
down_revision: Union[str, None] = 'e7b3a2c81f04'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'availability_rules',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('weekday', sa.Integer(), nullable=False),
        sa.Column('is_closed', sa.Boolean(), nullable=False),
        sa.Column('open_minutes', sa.Integer(), nullable=False),
        sa.Column('close_minutes', sa.Integer(), nullable=False),
        sa.UniqueConstraint('weekday', name='uq_availability_weekday'),
    )

    op.create_table(
        'appointments',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('client_name', sa.String(), nullable=False),
        sa.Column('client_phone', sa.String(), nullable=False),
        sa.Column('note', sa.String(), nullable=True),
        sa.Column('service_id', sa.String(), sa.ForeignKey('services.id'), nullable=True),
        sa.Column('service_name', sa.String(), nullable=False),
        sa.Column('starts_at', sa.DateTime(), nullable=False),
        sa.Column('duration_minutes', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('client_id', sa.String(), sa.ForeignKey('clients.id'), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table('appointments')
    op.drop_table('availability_rules')
