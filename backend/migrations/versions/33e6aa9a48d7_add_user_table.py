"""Add user table

Revision ID: 33e6aa9a48d7
Revises: 4b80b9859b79
Create Date: 2024-04-23 01:57:35.665974

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '33e6aa9a48d7'
down_revision: Union[str, None] = '4b80b9859b79'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('users',
    sa.Column('pennkey', sa.String(), nullable=False),
    sa.Column('hashed_password', sa.LargeBinary(), nullable=False),
    sa.Column('first_name', sa.String(), nullable=False),
    sa.Column('last_name', sa.String(), nullable=False),
    sa.Column('school', sa.Enum('sas', 'seas', 'wharton', name='school', create_constraint=True), nullable=False),
    sa.PrimaryKeyConstraint('pennkey')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('users')
    # ### end Alembic commands ###