from beanie import Document
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

class SessionData(BaseModel):
    createdAt: datetime = Field(default_factory=datetime.now)
    lastActiveAt: datetime = Field(default_factory=datetime.now)
    totalSymptomChecks: int = 0
    totalDoctorSearches: int = 0
    isActive: bool = True

class Location(BaseModel):
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    coordinates: Optional[dict] = None

class EmergencyContact(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    relationship: Optional[str] = None

class Preferences(BaseModel):
    notifications: bool = False
    dataSharing: bool = False
    emergencyContact: Optional[EmergencyContact] = None

class Patient(Document):
    sessionId: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    location: Optional[Location] = None
    preferences: Optional[Preferences] = None
    sessionData: SessionData = Field(default_factory=SessionData)
    
    class Settings:
        name = "patients"
        indexes = [
            "sessionId",
            "email",
            "sessionData.lastActiveAt"
        ]
    
    def update_last_active(self):
        self.sessionData.lastActiveAt = datetime.now()
    
    def increment_symptom_checks(self):
        self.sessionData.totalSymptomChecks += 1
        self.update_last_active()
    
    def increment_doctor_searches(self):
        self.sessionData.totalDoctorSearches += 1
        self.update_last_active()