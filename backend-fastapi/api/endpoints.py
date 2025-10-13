from fastapi import APIRouter, HTTPException
from models.schemas import SymptomCheckRequest, SymptomCheckResponse, DoctorFinderRequest, DoctorFinderResponse
from core.services import analyze_symptoms, find_nearby_doctors

router = APIRouter()

@router.post("/api/symptoms/check", response_model=SymptomCheckResponse)
async def check_symptoms(request: SymptomCheckRequest):
    try:
        response = await analyze_symptoms(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/doctors/nearby", response_model=DoctorFinderResponse)
async def find_doctors(request: DoctorFinderRequest):
    try:
        response = await find_nearby_doctors(request)
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
