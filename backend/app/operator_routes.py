from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from . import models, schemas, auth
from .database import get_db
from .decorators import require_role

router = APIRouter(prefix="/operator", tags=["operator"])

@router.post("/routes/", response_model=schemas.Route)
@require_role(models.UserRole.OPERATOR)
async def create_route(route: schemas.RouteCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_route = models.Route(**route.dict())
    db.add(db_route)
    db.commit()
    db.refresh(db_route)
    return db_route

@router.post("/catch/", response_model=schemas.Catch)
@require_role(models.UserRole.OPERATOR)
async def log_catch(catch: schemas.CatchCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_catch = models.Catch(**catch.dict())
    db.add(db_catch)
    db.commit()
    db.refresh(db_catch)
    return db_catch

@router.get("/ships/", response_model=List[schemas.Ship])
@require_role(models.UserRole.OPERATOR)
async def get_ships(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Ship).filter(models.Ship.user_id == current_user.id).all()

@router.post("/ships/", response_model=schemas.Ship)
@require_role(models.UserRole.OPERATOR)
async def create_ship(ship: schemas.ShipCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_ship = models.Ship(**ship.dict())
    db.add(db_ship)
    db.commit()
    db.refresh(db_ship)
    return db_ship

@router.put("/ships/{ship_id}", response_model=schemas.Ship)
@require_role(models.UserRole.OPERATOR)
async def update_ship(ship_id: int, ship: schemas.ShipCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_ship = db.query(models.Ship).filter(models.Ship.id == ship_id).first()
    if not db_ship:
        raise HTTPException(status_code=404, detail="Судно не найдено")
    for key, value in ship.dict().items():
        setattr(db_ship, key, value)
    db.commit()
    db.refresh(db_ship)
    return db_ship

@router.post("/routes/{route_id}/fishing_spots/", response_model=schemas.Route)
@require_role(models.UserRole.OPERATOR)
async def add_fishing_spot_to_route(route_id: int, spot_ids: List[int], db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_route = db.query(models.Route).filter(models.Route.id == route_id).first()
    if not db_route:
        raise HTTPException(status_code=404, detail="Рейс не найден")
    spots = db.query(models.FishingSpot).filter(models.FishingSpot.id.in_(spot_ids)).all()
    db_route.fishing_spots.extend(spots)
    db.commit()
    db.refresh(db_route)
    return db_route

@router.get("/reports/standard/")
@require_role(models.UserRole.OPERATOR)
async def get_standard_report():
    return {"message": "Формирование стандартных отчетов. Реализовать по ТЗ."}

@router.get("/export/")
@require_role(models.UserRole.OPERATOR)
async def export_data(format: str = Query("excel", enum=["excel", "pdf"])):
    return {"message": f"Экспорт данных в {format.upper()} (заглушка)"}

@router.get("/routes/search/", response_model=List[schemas.Route])
@require_role(models.UserRole.OPERATOR)
async def search_routes(
    db: Session = Depends(get_db),
    ship_id: Optional[int] = None,
    captain_id: Optional[int] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None
):
    query = db.query(models.Route)
    if ship_id:
        query = query.filter(models.Route.ship_id == ship_id)
    if captain_id:
        query = query.filter(models.Route.captain_id == captain_id)
    if date_from:
        query = query.filter(models.Route.departure_time >= date_from)
    if date_to:
        query = query.filter(models.Route.return_time <= date_to)
    return query.all()

@router.get("/catch/statistics/")
@require_role(models.UserRole.OPERATOR)
async def catch_statistics(
    db: Session = Depends(get_db),
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None
):
    query = db.query(models.Catch)
    if date_from:
        query = query.filter(models.Catch.route.has(models.Route.departure_time >= date_from))
    if date_to:
        query = query.filter(models.Catch.route.has(models.Route.return_time <= date_to))
    total_weight = sum([c.weight for c in query.all()])
    return {"total_weight": total_weight, "count": query.count()}

@router.delete("/ships/{ship_id}")
@require_role(models.UserRole.OPERATOR)
async def delete_ship(ship_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_ship = db.query(models.Ship).filter(
        models.Ship.id == ship_id,
        models.Ship.user_id == current_user.id
    ).first()
    
    if not db_ship:
        raise HTTPException(status_code=404, detail="Судно не найдено")
    
    db.delete(db_ship)
    db.commit()
    return {"message": "Судно успешно удалено"}

@router.get("/captains/", response_model=List[schemas.User])
@require_role(models.UserRole.OPERATOR)
async def get_captains(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.User).filter(models.User.role == models.UserRole.CAPTAIN).all()

@router.get("/routes/", response_model=List[schemas.Route])
@require_role(models.UserRole.OPERATOR)
async def get_routes(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Route).filter(models.Route.operator_id == current_user.id).all()

@router.delete("/routes/{route_id}")
@require_role(models.UserRole.OPERATOR)
async def delete_route(route_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    route = db.query(models.Route).filter(
        models.Route.id == route_id,
        models.Route.operator_id == current_user.id
    ).first()
    
    if not route:
        raise HTTPException(status_code=404, detail="Рейс не найден")
    
    db.delete(route)
    db.commit()
    return {"message": "Рейс успешно удален"} 