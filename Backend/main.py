from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import schemas

from database import engine, SessionLocal

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="OpsPulse API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Home
@app.get("/")
def home():
    return {"message": "OpsPulse API is running"}


# ==========================
# Applications
# ==========================

@app.post("/applications", response_model=schemas.ApplicationOut)
def create_application(
    app_data: schemas.ApplicationCreate,
    db: Session = Depends(get_db)
):
    app_record = models.Application(**app_data.model_dump())

    db.add(app_record)
    db.commit()
    db.refresh(app_record)

    return app_record


@app.get("/applications", response_model=list[schemas.ApplicationOut])
def get_applications(db: Session = Depends(get_db)):
    return db.query(models.Application).all()


@app.get("/applications/{application_id}",
         response_model=schemas.ApplicationOut)
def get_application(
    application_id: int,
    db: Session = Depends(get_db)
):
    app_record = (
        db.query(models.Application)
        .filter(models.Application.id == application_id)
        .first()
    )

    return app_record


@app.delete("/applications/{application_id}")
def delete_application(
    application_id: int,
    db: Session = Depends(get_db)
):
    app_record = (
        db.query(models.Application)
        .filter(models.Application.id == application_id)
        .first()
    )

    if app_record is None:
        return {"message": "Application not found"}

    db.delete(app_record)
    db.commit()

    return {
        "message": f"Application {application_id} deleted"
    }


# ==========================
# Incidents
# ==========================

@app.post("/incidents", response_model=schemas.IncidentOut)
def create_incident(
    incident: schemas.IncidentCreate,
    db: Session = Depends(get_db)
):
    record = models.Incident(**incident.model_dump())

    db.add(record)
    db.commit()
    db.refresh(record)

    return record


@app.get("/incidents", response_model=list[schemas.IncidentOut])
def get_incidents(db: Session = Depends(get_db)):
    return db.query(models.Incident).all()

@app.get("/applications/{application_id}/incidents")
def get_application_incidents(
    application_id: int,
    db: Session = Depends(get_db)
):
    incidents = (
        db.query(models.Incident)
        .filter(models.Incident.application_id == application_id)
        .all()
    )

    return incidents

@app.post("/deployments", response_model=schemas.DeploymentOut)
def create_deployment(
    deployment: schemas.DeploymentCreate,
    db: Session = Depends(get_db)
):
    record = models.Deployment(**deployment.model_dump())

    db.add(record)
    db.commit()
    db.refresh(record)

    return record


@app.get("/deployments", response_model=list[schemas.DeploymentOut])
def get_deployments(db: Session = Depends(get_db)):
    return db.query(models.Deployment).all()


@app.get("/applications/{application_id}/deployments",
         response_model=list[schemas.DeploymentOut])
def get_application_deployments(
    application_id: int,
    db: Session = Depends(get_db)
):
    return (
        db.query(models.Deployment)
        .filter(models.Deployment.application_id == application_id)
        .all()
    )