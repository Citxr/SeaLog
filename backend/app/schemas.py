from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime
from .models import UserRole, ShipType, FishType

class UserBase(BaseModel):
    email: EmailStr
    role: UserRole
    full_name: Optional[str] = None
    company_name: Optional[str] = None
    license: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class ShipBase(BaseModel):
    name: str
    type: ShipType
    displacement: float
    build_date: date
    

class ShipCreate(ShipBase):
    user_id: int

class Ship(ShipBase):
    id: int
    user_id: int
    class Config:
        orm_mode = True

class CatchBase(BaseModel):
    fish_type: FishType
    weight: float

class CatchCreate(CatchBase):
    user_id: int
    route_id: int

class Catch(CatchBase):
    id: int
    user_id: int
    route_id: int
    class Config:
        orm_mode = True

class FishingSpotBase(BaseModel):
    name: str
    coordinates: str
    depth: float
    fish_type: FishType
    arrival_time: Optional[datetime] = None
    departure_time: Optional[datetime] = None

class FishingSpotCreate(FishingSpotBase):
    pass

class FishingSpot(FishingSpotBase):
    id: int
    class Config:
        orm_mode = True

class RouteBase(BaseModel):
    ship_id: int
    operator_id: int
    captain_id: int
    code: Optional[str] = None
    departure_time: Optional[datetime] = None
    return_time: Optional[datetime] = None

class RouteCreate(RouteBase):
    pass

class Route(RouteBase):
    id: int
    class Config:
        orm_mode = True

class ReportBase(BaseModel):
    fish_type: str
    weight: float
    location: str
    notes: Optional[str] = None
    route_id: Optional[int] = None

class ReportCreate(ReportBase):
    class Config:
        json_schema_extra = {
            "example": {
                "fish_type": "треска",
                "weight": 10.5,
                "location": "Баренцево море",
                "notes": "Хороший улов",
                "route_id": 1
            }
        }

class ReportInDB(ReportBase):
    id: int
    status: str
    created_at: datetime
    user_id: int

    class Config:
        from_attributes = True

class Report(ReportInDB):
    user: User

    class Config:
        from_attributes = True
