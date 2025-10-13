from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from ..services.gemini_ai import analyze_symptoms, get_medications

router = APIRouter()

class Symptom(BaseModel):
    name: str
    severity: Optional[str] = Field(None, pattern=r"^(mild|moderate|severe)$")
    duration: Optional[str] = None
    description: Optional[str] = None

class AnalyzeRequest(BaseModel):
    sessionId: Optional[str] = None
    symptoms: List[Symptom]
    patientInfo: Optional[Dict[str, Any]] = {}

class AnalyzeResponse(BaseModel):
    status: str
    data: Dict[str, Any]

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest):
    if not req.symptoms:
        raise HTTPException(status_code=400, detail="No symptoms provided")
    analysis = await analyze_symptoms([s.model_dump() for s in req.symptoms], req.patientInfo or {})
    return {"status": "success", "data": {"analysis": analysis}}

class MedicationRequest(BaseModel):
    symptoms: List[str]
    severity: Optional[str] = None
    age: Optional[int] = None
    conditions: Optional[List[str]] = None

@router.post("/medications")
async def medications(req: MedicationRequest):
    result = await get_medications(req.model_dump())
    return {"status": "success", "data": result}

@router.get("/emergency-signs")
async def emergency_signs():
    return {
        "status": "success",
        "data": {
            "signs": [
                "Chest pain lasting more than a few minutes",
                "Severe shortness of breath",
                "Sudden weakness or numbness",
                "Severe, uncontrolled bleeding",
                "Loss of consciousness"
            ]
        }
    }
