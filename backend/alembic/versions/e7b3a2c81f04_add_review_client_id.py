"""add client_id to reviews

Revision ID: e7b3a2c81f04
Revises: d4e8f1a92c67
Create Date: 2026-08-30 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e7b3a2c81f04'
down_revision: Union[str, None] = 'd4e8f1a92c67'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('reviews', sa.Column('client_id', sa.String(), nullable=True))
    op.create_foreign_key('fk_reviews_client_id', 'reviews', 'clients', ['client_id'], ['id'])


def downgrade() -> None:
    op.drop_constraint('fk_reviews_client_id', 'reviews', type_='foreignkey')
    op.drop_column('reviews', 'client_id')
