"""update reports created_at

Revision ID: update_reports_created_at
Revises: add_route_id_to_reports
Create Date: 2024-03-19

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = 'update_reports_created_at'
down_revision = 'add_route_id_to_reports'
branch_labels = None
depends_on = None

def upgrade():
    # Обновляем существующие записи, устанавливая текущее время
    op.execute("UPDATE reports SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL")
    
    # Делаем поле created_at обязательным
    op.alter_column('reports', 'created_at',
        existing_type=sa.DateTime(),
        nullable=False,
        server_default=sa.text('CURRENT_TIMESTAMP')
    )

def downgrade():
    op.alter_column('reports', 'created_at',
        existing_type=sa.DateTime(),
        nullable=True,
        server_default=None
    ) 