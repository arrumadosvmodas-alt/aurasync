"""add cpf to users

Revision ID: 8c8d2b1f9a5a
Revises: 4e6a6e4e7d77
Create Date: 2026-07-14 20:40:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = "8c8d2b1f9a5a"
down_revision = "4e6a6e4e7d77"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("cpf", sa.String(length=11), nullable=True))
    op.create_index(op.f("ix_users_cpf"), "users", ["cpf"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_users_cpf"), table_name="users")
    op.drop_column("users", "cpf")
