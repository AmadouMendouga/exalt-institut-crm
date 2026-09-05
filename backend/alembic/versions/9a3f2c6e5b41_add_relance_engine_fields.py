"""add relance engine fields (birth date, opt-in, scheduled_at, dispatch log)

Revision ID: 9a3f2c6e5b41
Revises: 38100d7add67
Create Date: 2026-08-29 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9a3f2c6e5b41'
down_revision: Union[str, None] = '38100d7add67'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('clients', sa.Column('birth_date', sa.String(), nullable=True))
    op.add_column(
        'clients',
        sa.Column('marketing_opt_in', sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.alter_column('clients', 'marketing_opt_in', server_default=None)

    op.add_column('timeline_items', sa.Column('scheduled_at', sa.DateTime(), nullable=True))
    op.execute('UPDATE timeline_items SET scheduled_at = created_at WHERE scheduled_at IS NULL')
    op.alter_column('timeline_items', 'scheduled_at', nullable=False)

    op.create_table(
        'campaign_dispatch_log',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('campaign_id', sa.String(), nullable=False),
        sa.Column('client_id', sa.String(), nullable=False),
        sa.Column('period_key', sa.String(), nullable=False),
        sa.Column('dispatched_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['campaign_id'], ['automation_campaigns.id']),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('campaign_id', 'client_id', 'period_key', name='uq_campaign_client_period'),
    )


def downgrade() -> None:
    op.drop_table('campaign_dispatch_log')
    op.alter_column('timeline_items', 'scheduled_at', nullable=True)
    op.drop_column('timeline_items', 'scheduled_at')
    op.drop_column('clients', 'marketing_opt_in')
    op.drop_column('clients', 'birth_date')
