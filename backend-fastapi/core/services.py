import os
import httpx
from datetime import datetime
from core.database import db
from models.schemas import SymptomCheckRequest, SymptomCheckResponse, DoctorFinderRequest, DoctorFinderResponse

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
NOMINATIM_URL = os.getenv("NOMINATIM_URL")
OVERPASS_URL = os.getenv("OVERPASS_URL")

async def analyze_symptoms(request: SymptomCheckRequest) -> SymptomCheckResponse:
    prompt = f"Analyze the following symptoms: {request.symptoms}"
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://gemini.googleapis.com/v1/analyze",
            headers={"Authorization": f"Bearer {GEMINI_API_KEY}"},
            json={"prompt": prompt},
        )
        response.raise_for_status()
        data = response.json()

    document = {
        "user_id": request.user_id,
        "symptoms": request.symptoms,
        "response": data,
        "timestamp": datetime.utcnow(),
    }
    await db.symptom_checks.insert_one(document)

    return SymptomCheckResponse(**data)

async def find_nearby_doctors(request: DoctorFinderRequest) -> DoctorFinderResponse:
    if request.latitude and request.longitude:
        coordinates = (request.latitude, request.longitude)
    elif request.address:
        async with httpx.AsyncClient() as client:
            response = await client.get(NOMINATIM_URL, params={"q": request.address, "format": "json"})
            response.raise_for_status()
            data = response.json()
            if not data:
                raise ValueError("Address not found")
            coordinates = (float(data[0]["lat"]), float(data[0]["lon"]))
    else:
        raise ValueError("Location information required")

    specialty_map = {"Skin Rash": "Dermatologist"}
    specialty = specialty_map.get(request.condition, "General Practitioner")

    query = f"""
    [out:json];
    node["amenity"="clinic"]["specialty"="{specialty}"](around:5000,{coordinates[0]},{coordinates[1]});
    out body;
    """
    async with httpx.AsyncClient() as client:
        response = await client.post(OVERPASS_URL, data={"data": query})
        response.raise_for_status()
        data = response.json()

    doctors = [
        {"name": element["tags"].get("name", "Unknown"), "type": specialty, "address": element["tags"].get("address", "Unknown")}
        for element in data.get("elements", [])
    ]
    return DoctorFinderResponse(doctors=doctors)
