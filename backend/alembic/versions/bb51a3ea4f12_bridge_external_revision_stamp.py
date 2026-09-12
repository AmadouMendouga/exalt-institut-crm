"""bridge external revision stamp

La base de production a été retrouvée avec cette révision déjà marquée comme
appliquée (alembic_version), sans qu'aucun fichier de migration correspondant
n'existe dans ce dépôt — probablement un marquage externe fait en dehors du
flux Alembic normal. Ce stub ne change rien au schéma : il sert uniquement à
reconnecter la chaîne de migrations pour que `alembic upgrade head` puisse à
nouveau progresser normalement.

Revision ID: bb51a3ea4f12
Revises: c1f4a7e60d38
Create Date: 2026-09-08 00:00:00.000000

"""
from typing import Sequence, Union


# revision identifiers, used by Alembic.
revision: str = 'bb51a3ea4f12'
down_revision: Union[str, None] = 'c1f4a7e60d38'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
