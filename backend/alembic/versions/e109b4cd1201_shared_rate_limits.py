"""Shared abuse protection; additive migration, no business data removed."""
from alembic import op
import sqlalchemy as sa

revision = 'e109b4cd1201'
down_revision = 'c3e7b1a95d24'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('request_rate_limits',
        sa.Column('key', sa.String(64), primary_key=True),
        sa.Column('bucket', sa.BigInteger(), primary_key=True),
        sa.Column('count', sa.Integer(), nullable=False))
    op.create_index('ix_request_rate_limits_bucket', 'request_rate_limits', ['bucket'])


def downgrade():
    op.drop_table('request_rate_limits')
