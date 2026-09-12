"""add campaign_media table

Revision ID: a9d3f7c15e64
Revises: f4a8c2e91b37
Create Date: 2026-09-10 00:00:00.000001

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a9d3f7c15e64'
down_revision: Union[str, None] = 'f4a8c2e91b37'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'campaign_media',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('kind', sa.String(), nullable=False),
        sa.Column('data', sa.LargeBinary(), nullable=False),
        sa.Column('content_type', sa.String(), nullable=False),
        sa.Column('filename', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.UniqueConstraint('kind', name='uq_campaign_media_kind'),
    )


def downgrade() -> None:
    op.drop_table('campaign_media')
