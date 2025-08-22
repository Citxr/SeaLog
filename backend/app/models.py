from sqlalchemy import Column, Integer, String, Boolean, Enum, Float, Date, DateTime, ForeignKey, Table, event
from sqlalchemy.orm import relationship
import enum
from .database import Base
from datetime import datetime
import sqlalchemy as sa

class UserRole(str, enum.Enum):
    OPERATOR = "operator"
    CAPTAIN = "captain"

class ShipType(str, enum.Enum):
    TRAWLER = "траулер"
    FREEZER = "морозный"
    FLAGMAN = "флагман"

class FishType(str, enum.Enum):
    COD = "треска"
    SALMON = "лосось"
    HERRING = "сельдь"
    OTHER = "другое"

RouteFishingSpot = Table(
    'route_fishing_spot', Base.metadata,
    Column('route_id', Integer, ForeignKey('routes.id'), primary_key=True),
    Column('fishing_spot_id', Integer, ForeignKey('fishing_spots.id'), primary_key=True)
)

UserFishingSpot = Table(
    'user_fishing_spot', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('fishing_spot_id', Integer, ForeignKey('fishing_spots.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    company_name = Column(String, nullable=True)
    hashed_password = Column(String)
    role = Column(Enum(UserRole))
    is_active = Column(Boolean, default=True)
    full_name = Column(String, nullable=True)
    license = Column(String, nullable=True)
    ships = relationship('Ship', back_populates='user')
    catches = relationship('Catch', back_populates='user')
    routes_as_operator = relationship('Route', back_populates='operator', foreign_keys='Route.operator_id')
    routes_as_captain = relationship('Route', back_populates='captain', foreign_keys='Route.captain_id')
    fishing_spots = relationship('FishingSpot', secondary=UserFishingSpot, back_populates='users')
    reports = relationship('Report', back_populates='user')

class Ship(Base):
    __tablename__ = 'ships'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    name = Column(String)
    type = Column(Enum(ShipType))
    displacement = Column(Float)
    build_date = Column(Date)
    user = relationship('User', back_populates='ships', foreign_keys=[user_id])
    routes = relationship('Route', back_populates='ship')

class Catch(Base):
    __tablename__ = 'catches'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    route_id = Column(Integer, ForeignKey('routes.id'))
    fish_type = Column(Enum(FishType))
    weight = Column(Float)
    user = relationship('User', back_populates='catches', foreign_keys=[user_id])
    route = relationship('Route', back_populates='catches', foreign_keys=[route_id])

class FishingSpot(Base):
    __tablename__ = 'fishing_spots'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    coordinates = Column(String)
    depth = Column(Float)
    fish_type = Column(Enum(FishType))
    arrival_time = Column(DateTime)
    departure_time = Column(DateTime)
    routes = relationship('Route', secondary=RouteFishingSpot, back_populates='fishing_spots')
    users = relationship('User', secondary=UserFishingSpot, back_populates='fishing_spots')

class Route(Base):
    __tablename__ = 'routes'
    id = Column(Integer, primary_key=True, index=True)
    ship_id = Column(Integer, ForeignKey('ships.id'))
    operator_id = Column(Integer, ForeignKey('users.id'))
    captain_id = Column(Integer, ForeignKey('users.id'))  
    code = Column(String)
    departure_time = Column(DateTime)
    return_time = Column(DateTime)
    ship = relationship('Ship', back_populates='routes', foreign_keys=[ship_id])
    operator = relationship('User', back_populates='routes_as_operator', foreign_keys=[operator_id])
    captain = relationship('User', back_populates='routes_as_captain', foreign_keys=[captain_id])
    catches = relationship('Catch', back_populates='route', foreign_keys=[Catch.route_id])
    fishing_spots = relationship('FishingSpot', secondary=RouteFishingSpot, back_populates='routes')
    reports = relationship('Report', back_populates='route')

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    fish_type = Column(String)
    weight = Column(Float)
    location = Column(String)
    notes = Column(String, nullable=True)
    status = Column(String, server_default='новый')
    created_at = Column(DateTime, server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=True)
    
    user = relationship("User", back_populates="reports")
    route = relationship("Route", back_populates="reports")

@event.listens_for(Report, 'before_insert')
def set_created_at(mapper, connection, target):
    target.created_at = datetime.utcnow()
