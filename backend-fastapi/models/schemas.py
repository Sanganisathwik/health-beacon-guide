from pydantic import BaseModel
from typing import List, Optional

class SymptomCheckRequest(BaseModel):
    symptoms: str
    user_id: Optional[str]

class SymptomCheckResponse(BaseModel):
    potential_conditions: List[dict]
    severity_assessment: str
    mandatory_disclaimer: str

class DoctorFinderRequest(BaseModel):
    condition: str
    latitude: Optional[float]
    longitude: Optional[float]
    address: Optional[str]

class DoctorFinderResponse(BaseModel):
    doctors: List[dict]
