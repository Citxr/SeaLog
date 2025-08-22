"""add depth and fish type to fishing spots

Revision ID: add_depth_and_fish_type_to_fishing_spots
Revises: 
Create Date: 2024-03-19 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_depth_and_fish_type_to_fishing_spots'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Добавляем колонку depth
    op.add_column('fishing_spots', sa.Column('depth', sa.Float(), nullable=True))
    
    # Добавляем колонку fish_type
    op.add_column('fishing_spots', sa.Column('fish_type', postgresql.ENUM('треска', 'лосось', 'сельдь', 'другое', name='fishtype'), nullable=True))

def downgrade():
    # Удаляем колонку fish_type
    op.drop_column('fishing_spots', 'fish_type')
    
    # Удаляем колонку depth
    op.drop_column('fishing_spots', 'depth') 