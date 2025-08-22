"""fix reports created_at

Revision ID: fix_reports_created_at
Revises: update_reports_created_at
Create Date: 2024-03-19

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = 'fix_reports_created_at'
down_revision = 'update_reports_created_at'
branch_labels = None
depends_on = None

def upgrade():
    # Удаляем значение по умолчанию для created_at
    op.alter_column('reports', 'created_at',
        existing_type=sa.DateTime(),
        nullable=False,
        server_default=None
    )
    
    # Обновляем существующие записи с некорректной датой
    op.execute("UPDATE reports SET created_at = CURRENT_TIMESTAMP WHERE created_at > CURRENT_TIMESTAMP")

def downgrade():
    op.alter_column('reports', 'created_at',
        existing_type=sa.DateTime(),
        nullable=False,
        server_default=sa.text('CURRENT_TIMESTAMP')
    ) 