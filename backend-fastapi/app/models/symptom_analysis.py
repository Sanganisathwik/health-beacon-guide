from beanie import Document
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class Symptom(BaseModel):
    name: str
    severity: str  # mild, moderate, severe
    duration: str
    description: Optional[str] = None
    bodyPart: Optional[str] = None
    triggers: List[str] = []
    alleviatingFactors: List[str] = []

class PossibleCondition(BaseModel):
    name: str
    probability: float  # 0-100
    description: Optional[str] = None
    severity: Optional[str] = None  # mild, moderate, severe, critical

class Recommendation(BaseModel):
    type: str  # immediate-care, self-care, monitor, lifestyle, follow-up
    action: str
    priority: str = "medium"  # low, medium, high, urgent
    timeframe: Optional[str] = None

class WarningFlag(BaseModel):
    flag: str
    severity: str  # caution, warning, critical
    action: Optional[str] = None

class MedicationSuggestion(BaseModel):
    name: str
    type: str  # over-the-counter, prescription, herbal, supplement
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    warnings: List[str] = []
    sideEffects: List[str] = []

class SpecialistRecommendation(BaseModel):
    recommended: bool = False
    specialties: List[str] = []
    urgency: Optional[str] = None  # routine, within-week, within-days, immediate

class Analysis(BaseModel):
    riskLevel: str  # low, medium, high, emergency
    confidence: float  # 0-100
    possibleConditions: List[PossibleCondition] = []
    recommendations: List[Recommendation] = []
    warningFlags: List[WarningFlag] = []
    medicationSuggestions: List[MedicationSuggestion] = []
    specialistRecommendation: Optional[SpecialistRecommendation] = None

class Feedback(BaseModel):
    helpful: Optional[bool] = None
    rating: Optional[int] = None  # 1-5
    comments: Optional[str] = None
    followedRecommendations: Optional[bool] = None

class Metadata(BaseModel):
    aiModel: str = "gemini-pro"
    processingTime: Optional[float] = None  # milliseconds
    tokensUsed: Optional[int] = None
    version: str = "1.0"
    language: str = "en"

class SymptomAnalysis(Document):
    sessionId: str
    patientId: Optional[str] = None  # Changed from ObjectId to str
    symptoms: List[Symptom]
    analysis: Analysis
    feedback: Optional[Feedback] = None
    metadata: Metadata = Field(default_factory=Metadata)
    createdAt: datetime = Field(default_factory=datetime.now)
    
    class Settings:
        name = "symptom_analyses"
        indexes = [
            [("sessionId", 1), ("createdAt", -1)],
            "analysis.riskLevel",
            "symptoms.name"
        ]
    
    def is_recent(self, hours_threshold: int = 24) -> bool:
        """Check if analysis is recent"""
        time_diff = datetime.now() - self.createdAt
        return time_diff.total_seconds() < (hours_threshold * 3600)
    
    def get_high_risk_conditions(self) -> List[PossibleCondition]:
        """Get high-risk conditions"""
        return [
            condition for condition in self.analysis.possibleConditions
            if condition.probability >= 70 or condition.severity in ["severe", "critical"]
        ]
    
    def get_urgent_recommendations(self) -> List[Recommendation]:
        """Get urgent recommendations"""
        return [
            rec for rec in self.analysis.recommendations
            if rec.priority in ["urgent", "high"]
        ]