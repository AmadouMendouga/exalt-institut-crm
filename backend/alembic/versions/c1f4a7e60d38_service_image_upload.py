"""services: store uploaded image bytes

Revision ID: c1f4a7e60d38
Revises: b8d3e5a17c92
Create Date: 2026-08-31 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c1f4a7e60d38'
down_revision: Union[str, None] = 'b8d3e5a17c92'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('services', sa.Column('image_data', sa.LargeBinary(), nullable=True))
    op.add_column('services', sa.Column('image_content_type', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('services', 'image_content_type')
    op.drop_column('services', 'image_data')
