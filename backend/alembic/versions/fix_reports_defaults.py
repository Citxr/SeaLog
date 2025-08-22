"""fix reports defaults

Revision ID: fix_reports_defaults
Revises: fix_reports_created_at
Create Date: 2024-03-19

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'fix_reports_defaults'
down_revision = 'fix_reports_created_at'
branch_labels = None
depends_on = None

def upgrade():
    # Устанавливаем server_default для created_at
    op.alter_column('reports', 'created_at',
        existing_type=sa.DateTime(),
        nullable=False,
        server_default=sa.text('CURRENT_TIMESTAMP')
    )
    
    # Устанавливаем server_default для status
    op.alter_column('reports', 'status',
        existing_type=sa.String(),
        server_default='новый'
    )

def downgrade():
    op.alter_column('reports', 'created_at',
        existing_type=sa.DateTime(),
        nullable=False,
        server_default=None
    )
    op.alter_column('reports', 'status',
        existing_type=sa.String(),
        server_default=None
    ) 