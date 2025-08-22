from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from . import models, schemas, auth, crud
from .database import engine, get_db
from .operator_routes import router as operator_router
from .captain_routes import router as captain_router
from typing import List

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fishing Fleet API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

@app.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        company_name=user.company_name,
        hashed_password=hashed_password,
        role=user.role,
        full_name=user.full_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

app.include_router(operator_router)
app.include_router(captain_router)

@app.get("/")
def read_root():
    return {"message": "Fishing Fleet API"}

@app.post("/reports", response_model=schemas.Report)
def create_report(
    report: schemas.ReportCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != "captain":
        raise HTTPException(status_code=403, detail="Только капитаны могут создавать отчеты")
    
    # Проверяем, что route_id существует, если он указан
    if report.route_id:
        route = db.query(models.Route).filter(models.Route.id == report.route_id).first()
        if not route:
            raise HTTPException(status_code=404, detail="Маршрут не найден")
        if route.captain_id != current_user.id:
            raise HTTPException(status_code=403, detail="Этот маршрут не назначен вам")
    
    return crud.create_report(db=db, report=report, user_id=current_user.id)

@app.get("/reports", response_model=List[schemas.Report])
def read_reports(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role == "captain":
        reports = crud.get_user_reports(db, user_id=current_user.id, skip=skip, limit=limit)
    else:
        reports = crud.get_reports(db, skip=skip, limit=limit)
    return reports

@app.post("/reports/{report_id}/approve")
def approve_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != "operator":
        raise HTTPException(status_code=403, detail="Только операторы могут подтверждать отчеты")
    report = crud.update_report_status(db, report_id=report_id, status="подтвержден")
    if not report:
        raise HTTPException(status_code=404, detail="Отчет не найден")
    return {"status": "success"}

@app.post("/reports/{report_id}/reject")
def reject_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != "operator":
        raise HTTPException(status_code=403, detail="Только операторы могут отклонять отчеты")
    report = crud.update_report_status(db, report_id=report_id, status="отклонен")
    if not report:
        raise HTTPException(status_code=404, detail="Отчет не найден")
    return {"status": "success"}
