"""appointments: support a cart of multiple services

Revision ID: b8d3e5a17c92
Revises: a4e1f7c92d05
Create Date: 2026-08-31 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


# revision identifiers, used by Alembic.
revision: str = 'b8d3e5a17c92'
down_revision: Union[str, None] = 'a4e1f7c92d05'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('appointments', sa.Column('services', JSONB(), nullable=True))
    op.execute(
        "UPDATE appointments SET services = "
        "jsonb_build_array(jsonb_build_object('id', service_id, 'name', service_name)) "
        "WHERE services IS NULL"
    )
    op.alter_column('appointments', 'services', nullable=False)
    op.drop_constraint('appointments_service_id_fkey', 'appointments', type_='foreignkey')
    op.drop_column('appointments', 'service_id')
    op.drop_column('appointments', 'service_name')


def downgrade() -> None:
    op.add_column('appointments', sa.Column('service_id', sa.String(), nullable=True))
    op.add_column('appointments', sa.Column('service_name', sa.String(), nullable=True))
    op.create_foreign_key('appointments_service_id_fkey', 'appointments', 'services', ['service_id'], ['id'])
    op.drop_column('appointments', 'services')
