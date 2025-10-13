from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
import uuid

router = APIRouter()

_sessions: Dict[str, Dict[str, Any]] = {}

class PatientSessionCreate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    age: Optional[int] = Field(None, ge=1, le=150)
    gender: Optional[str] = Field(None, pattern=r"^(male|female|other|prefer-not-to-say)$")
    location: Optional[Dict[str, Any]] = None

class PatientSessionUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    age: Optional[int] = Field(None, ge=1, le=150)
    gender: Optional[str] = Field(None, pattern=r"^(male|female|other|prefer-not-to-say)$")
    location: Optional[Dict[str, Any]] = None

@router.post("/session")
async def create_session(payload: PatientSessionCreate):
    session_id = f"sess_{uuid.uuid4().hex[:10]}"
    _sessions[session_id] = {
        "sessionId": session_id,
        "profile": payload.model_dump(exclude_none=True),
        "createdAt": datetime.utcnow().isoformat(),
        "lastActiveAt": datetime.utcnow().isoformat(),
        "totalSymptomChecks": 0,
        "totalDoctorSearches": 0,
        "isActive": True
    }
    return {"status": "success", "data": _sessions[session_id]}

@router.put("/session/{session_id}")
async def update_session(session_id: str, payload: PatientSessionUpdate):
    if session_id not in _sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    sess = _sessions[session_id]
    sess["profile"].update(payload.model_dump(exclude_none=True))
    sess["lastActiveAt"] = datetime.utcnow().isoformat()
    return {"status": "success", "data": sess}

@router.get("/session/{session_id}")
async def get_session(session_id: str):
    if session_id not in _sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"status": "success", "data": _sessions[session_id]}

@router.get("/session/{session_id}/analytics")
async def session_analytics(session_id: str):
    if session_id not in _sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    s = _sessions[session_id]
    return {
        "status": "success",
        "data": {
            "totals": {
                "symptomChecks": s.get("totalSymptomChecks", 0),
                "doctorSearches": s.get("totalDoctorSearches", 0)
            }
        }
    }
