"""add route_id to reports

Revision ID: add_route_id_to_reports
Revises: create_reports_table
Create Date: 2024-03-19

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_route_id_to_reports'
down_revision = 'create_reports_table'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('reports', sa.Column('route_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        'fk_reports_route_id_routes',
        'reports', 'routes',
        ['route_id'], ['id']
    )

def downgrade():
    op.drop_constraint('fk_reports_route_id_routes', 'reports', type_='foreignkey')
    op.drop_column('reports', 'route_id') 