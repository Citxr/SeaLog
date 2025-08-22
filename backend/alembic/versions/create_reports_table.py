"""create reports table

Revision ID: create_reports_table
Revises: 
Create Date: 2024-03-19

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'create_reports_table'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'reports',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('fish_type', sa.String(), nullable=False),
        sa.Column('weight', sa.Float(), nullable=False),
        sa.Column('location', sa.String(), nullable=False),
        sa.Column('notes', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=False, server_default='новый'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('reports') 