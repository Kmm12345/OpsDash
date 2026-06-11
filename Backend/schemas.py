from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ApplicationCreate(BaseModel):
    name: str
    environment: str
    owner: str
    status: str

class ApplicationOut(ApplicationCreate):
    id: int
    last_checked: datetime

    class Config:
        from_attributes = True


class IncidentCreate(BaseModel):
    title: str
    severity: str
    status: str
    application_id: int
    root_cause: Optional[str] = None

class IncidentOut(IncidentCreate):
    id: int
    opened_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DeploymentCreate(BaseModel):
    version: str
    environment: str
    deployed_by: str
    status: str
    application_id: int


class DeploymentOut(DeploymentCreate):
    id: int
    deployed_at: datetime

    class Config:
        from_attributes = True