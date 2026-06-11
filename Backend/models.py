from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    environment = Column(String, nullable=False)
    owner = Column(String, nullable=False)
    status = Column(String, nullable=False)
    last_checked = Column(DateTime, default=datetime.utcnow)

    incidents = relationship("Incident", back_populates="application")
    deployments = relationship("Deployment", back_populates="application")


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    status = Column(String, nullable=False)
    root_cause = Column(String, nullable=True)
    opened_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    application_id = Column(Integer, ForeignKey("applications.id"))
    application = relationship("Application", back_populates="incidents")


class Deployment(Base):
    __tablename__ = "deployments"

    id = Column(Integer, primary_key=True, index=True)
    version = Column(String, nullable=False)
    environment = Column(String, nullable=False)
    deployed_by = Column(String, nullable=False)
    status = Column(String, nullable=False)
    deployed_at = Column(DateTime, default=datetime.utcnow)

    application_id = Column(Integer, ForeignKey("applications.id"))
    application = relationship("Application", back_populates="deployments")