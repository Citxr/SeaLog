from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from . import models, schemas, auth
from .database import get_db
from .decorators import require_role

router = APIRouter(prefix="/captain", tags=["captain"])

@router.get("/routes/", response_model=List[schemas.Route])
@require_role(models.UserRole.CAPTAIN)
async def get_my_routes(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Route).filter(models.Route.captain_id == current_user.id).all()

@router.get("/fishing_spots/", response_model=List[schemas.FishingSpot])
@require_role(models.UserRole.CAPTAIN)
async def get_fishing_spots(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.FishingSpot).all()

@router.post("/fishing_spots/", response_model=schemas.FishingSpot)
@require_role(models.UserRole.CAPTAIN)
async def create_fishing_spot(spot: schemas.FishingSpotCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_spot = models.FishingSpot(**spot.dict())
    db.add(db_spot)
    db.commit()
    db.refresh(db_spot)
    return db_spot

@router.post("/routes/{route_id}/comment/")
@require_role(models.UserRole.CAPTAIN)
async def add_comment(route_id: int, comment: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return {"message": f"Комментарий к рейсу {route_id} добавлен (заглушка)", "comment": comment}

@router.put("/fishing_spots/{spot_id}/time/", response_model=schemas.FishingSpot)
@require_role(models.UserRole.CAPTAIN)
async def update_fishing_spot_time(spot_id: int, arrival_time: Optional[datetime] = None, departure_time: Optional[datetime] = None, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    spot = db.query(models.FishingSpot).filter(models.FishingSpot.id == spot_id).first()
    if not spot:
        raise HTTPException(status_code=404, detail="Точка лова не найдена")
    if arrival_time:
        spot.arrival_time = arrival_time
    if departure_time:
        spot.departure_time = departure_time
    db.commit()
    db.refresh(spot)
    return spot

@router.post("/ships/{ship_id}/status/")
@require_role(models.UserRole.CAPTAIN)
async def set_ship_status(ship_id: int, status: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return {"message": f"Состояние судна {ship_id} зафиксировано (заглушка)", "status": status}

@router.get("/reports/standard/")
@require_role(models.UserRole.CAPTAIN)
async def get_standard_report():
    return {"message": "Формирование стандартных отчетов для капитана. Реализовать по ТЗ."}

@router.post("/reports/{report_id}/cancel", response_model=schemas.Report)
@require_role(models.UserRole.CAPTAIN)
async def cancel_report(report_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not db_report:
        raise HTTPException(status_code=404, detail="Отчет не найден")
    if db_report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нет доступа к этому отчету")
    db_report.status = "отменен"
    db.commit()
    db.refresh(db_report)
    return db_report

@router.delete("/fishing_spots/{spot_id}")
@require_role(models.UserRole.CAPTAIN)
async def delete_fishing_spot(spot_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    spot = db.query(models.FishingSpot).filter(models.FishingSpot.id == spot_id).first()
    if not spot:
        raise HTTPException(status_code=404, detail="Точка лова не найдена")
    
    db.delete(spot)
    db.commit()
    return {"message": "Точка лова успешно удалена"}
