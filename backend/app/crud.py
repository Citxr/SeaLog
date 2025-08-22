from sqlalchemy.orm import Session
from . import models, schemas
from datetime import datetime

def create_report(db: Session, report: schemas.ReportCreate, user_id: int):
    report_data = report.dict()
    db_report = models.Report(
        fish_type=report_data['fish_type'],
        weight=report_data['weight'],
        location=report_data['location'],
        notes=report_data.get('notes'),
        route_id=report_data.get('route_id'),
        user_id=user_id
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

def get_reports(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Report).offset(skip).limit(limit).all()

def get_user_reports(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Report).filter(models.Report.user_id == user_id).offset(skip).limit(limit).all()

def get_route_reports(db: Session, route_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Report).filter(models.Report.route_id == route_id).offset(skip).limit(limit).all()

def get_report(db: Session, report_id: int):
    return db.query(models.Report).filter(models.Report.id == report_id).first()

def update_report_status(db: Session, report_id: int, status: str):
    db_report = get_report(db, report_id)
    if db_report:
        db_report.status = status
        db.commit()
        db.refresh(db_report)
    return db_report 