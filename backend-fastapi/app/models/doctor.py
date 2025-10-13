from beanie import Document
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import math

class Coordinates(BaseModel):
    latitude: float
    longitude: float

class Qualification(BaseModel):
    degree: str
    institution: str
    year: int
    verified: bool = False

class Experience(BaseModel):
    years: int = 0
    previousPositions: List[dict] = []

class Contact(BaseModel):
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None

class Address(BaseModel):
    street: Optional[str] = None
    city: str
    state: Optional[str] = None
    zipCode: Optional[str] = None
    country: str = "India"

class Hospital(BaseModel):
    name: str
    address: Address
    coordinates: Coordinates
    type: str = "hospital"  # government, private, semi-private, clinic, hospital, nursing-home

class Location(BaseModel):
    hospital: Hospital
    consultationModes: List[str] = ["in-person"]

class TimeSlot(BaseModel):
    startTime: str  # "09:00"
    endTime: str    # "17:00"
    type: str = "regular"  # regular, emergency, appointment-only

class Schedule(BaseModel):
    day: str  # monday, tuesday, etc.
    slots: List[TimeSlot] = []

class Availability(BaseModel):
    schedule: List[Schedule] = []
    emergencyAvailable: bool = False
    nextAvailableSlot: Optional[datetime] = None

class ConsultationFee(BaseModel):
    inPerson: Optional[float] = None
    online: Optional[float] = None

class Fees(BaseModel):
    consultationFee: Optional[ConsultationFee] = None
    currency: str = "INR"
    acceptsInsurance: bool = False
    insuranceProviders: List[str] = []

class RatingBreakdown(BaseModel):
    five: int = 0
    four: int = 0
    three: int = 0
    two: int = 0
    one: int = 0

class Ratings(BaseModel):
    average: float = 0.0
    totalReviews: int = 0
    breakdown: Optional[RatingBreakdown] = None

class Service(BaseModel):
    name: str
    description: Optional[str] = None
    price: Optional[float] = None

class Verification(BaseModel):
    isVerified: bool = False
    verificationDate: Optional[datetime] = None
    licenseNumber: Optional[str] = None
    medicalCouncil: Optional[str] = None

class DoctorMetadata(BaseModel):
    source: str = "manual"  # manual, api, scraping, partner
    lastUpdated: datetime = Field(default_factory=datetime.now)
    isActive: bool = True
    searchCount: int = 0

class Doctor(Document):
    name: str
    specialty: str  # general-practitioner, cardiology, etc.
    qualifications: List[Qualification] = []
    experience: Optional[Experience] = None
    contact: Optional[Contact] = None
    location: Location
    availability: Optional[Availability] = None
    fees: Optional[Fees] = None
    ratings: Optional[Ratings] = None
    languages: List[str] = ["English", "Hindi"]
    services: List[Service] = []
    verification: Optional[Verification] = None
    metadata: DoctorMetadata = Field(default_factory=DoctorMetadata)
    
    class Settings:
        name = "doctors"
        indexes = [
            [("specialty", 1), ("location.hospital.coordinates", "2dsphere")],
            [("location.hospital.city", 1), ("specialty", 1)],
            [("ratings.average", -1)],
            "verification.isVerified",
            [("name", "text"), ("location.hospital.name", "text")]
        ]
    
    def calculate_distance(self, lat: float, lng: float) -> float:
        """Calculate distance from given coordinates using Haversine formula"""
        R = 6371  # Earth's radius in kilometers
        
        lat1 = math.radians(self.location.hospital.coordinates.latitude)
        lon1 = math.radians(self.location.hospital.coordinates.longitude)
        lat2 = math.radians(lat)
        lon2 = math.radians(lng)
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = (math.sin(dlat/2)**2 + 
             math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2)
        c = 2 * math.asin(math.sqrt(a))
        
        return R * c
    
    def increment_search_count(self):
        """Increment search count"""
        self.metadata.searchCount += 1
        self.metadata.lastUpdated = datetime.now()
    
    def is_available_on(self, day_name: str) -> bool:
        """Check if doctor is available on a specific day"""
        if not self.availability or not self.availability.schedule:
            return False
            
        return any(
            sched.day.lower() == day_name.lower() and sched.slots
            for sched in self.availability.schedule
        )
    
    @property
    def full_address(self) -> str:
        """Get full formatted address"""
        addr = self.location.hospital.address
        parts = [
            addr.street,
            addr.city,
            addr.state,
            addr.zipCode,
            addr.country
        ]
        return ", ".join(part for part in parts if part)
    
    @property
    def experience_level(self) -> str:
        """Get experience level based on years"""
        if not self.experience:
            return "unknown"
            
        years = self.experience.years
        if years < 2:
            return "junior"
        elif years < 10:
            return "mid-level"
        elif years < 20:
            return "senior"
        else:
            return "expert"