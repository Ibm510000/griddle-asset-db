"""Initial migration

Revision ID: a5360e263bad
Revises: 
Create Date: 2024-03-29 14:27:01.568711

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a5360e263bad'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('assets',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('asset_name', sa.String(), nullable=False),
    sa.Column('author_pennkey', sa.String(), nullable=False),
    sa.Column('keywords', sa.String(), nullable=False),
    sa.Column('image_uri', sa.String(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('versions',
    sa.Column('asset_id', sa.Uuid(), nullable=False),
    sa.Column('semver', sa.String(), nullable=False),
    sa.Column('author_pennkey', sa.String(), nullable=False),
    sa.Column('date', sa.DateTime(), nullable=False),
    sa.Column('message', sa.String(), nullable=False),
    sa.Column('file_key', sa.String(), nullable=False),
    sa.ForeignKeyConstraint(['asset_id'], ['assets.id'], ),
    sa.PrimaryKeyConstraint('asset_id', 'semver')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('versions')
    op.drop_table('assets')
    # ### end Alembic commands ###