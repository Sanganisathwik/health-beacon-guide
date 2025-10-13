from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Tuple
import httpx
import os
import math

OSM_NOMINATIM_URL = os.getenv("NOMINATIM_URL", "https://nominatim.openstreetmap.org/search")
OVERPASS_URLS = [
    os.getenv("OVERPASS_URL", "https://overpass-api.de/api/interpreter"),
    "https://overpass.openstreetmap.ru/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter"
]
USER_AGENT = os.getenv("APP_USER_AGENT", "health-beacon/1.0 (contact: youremail@example.com)")
MOCK_MODE = os.getenv("MOCK_NEARBY", "false").lower() == "true"

router = APIRouter()

class Coordinates(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)

class NearbyRequest(BaseModel):
    address: Optional[str] = Field(None, description="Free-form address string")
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    radius_km: float = Field(5, gt=0, le=50, description="Search radius in kilometers")
    limit: int = Field(25, gt=0, le=100)

    @validator("longitude")
    def require_both_coords(cls, v, values):
        lat = values.get("latitude")
        if (v is None) != (lat is None):
            raise ValueError("Both latitude and longitude must be provided together")
        return v

class Doctor(BaseModel):
    name: str
    specialty: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    coordinates: Coordinates
    source: str = "osm"
    distance_km: Optional[float] = None

class NearbyResponse(BaseModel):
    center: Coordinates
    radius_km: float
    total: int
    doctors: List[Doctor]

async def geocode_address(address: str) -> Coordinates:
    params = {
        "q": address,
        "format": "json",
        "limit": 1,
        "addressdetails": 1
    }
    headers = {"User-Agent": USER_AGENT}
    timeout = httpx.Timeout(10.0, read=10.0)
    async with httpx.AsyncClient(headers=headers, timeout=timeout) as client:
        r = await client.get(OSM_NOMINATIM_URL, params=params)
        if r.status_code != 200:
            raise HTTPException(status_code=502, detail="Geocoding service error")
        data = r.json()
        if not data:
            raise HTTPException(status_code=404, detail="Address not found")
        lat = float(data[0]["lat"])
        lon = float(data[0]["lon"])
        return Coordinates(latitude=lat, longitude=lon)

async def fetch_overpass(lat: float, lon: float, radius_m: int, limit: int):
    # Doctors, clinics, hospitals
    # amenity=doctors is rare; often healthcare=doctor; clinics/hospitals also relevant
    query = f"""
    [out:json][timeout:25];
    (
      node["healthcare"="doctor"](around:{radius_m},{lat},{lon});
      node["healthcare"="clinic"](around:{radius_m},{lat},{lon});
      node["amenity"="clinic"](around:{radius_m},{lat},{lon});
      node["amenity"="hospital"](around:{radius_m},{lat},{lon});
      way["healthcare"="clinic"](around:{radius_m},{lat},{lon});
      way["amenity"="clinic"](around:{radius_m},{lat},{lon});
      way["amenity"="hospital"](around:{radius_m},{lat},{lon});
      relation["amenity"="hospital"](around:{radius_m},{lat},{lon});
    );
    out center {limit};
    """
    headers = {"User-Agent": USER_AGENT, "Content-Type": "application/x-www-form-urlencoded"}
    timeout = httpx.Timeout(25.0, read=25.0)
    last_exc: Optional[Exception] = None
    async with httpx.AsyncClient(headers=headers, timeout=timeout) as client:
        for url in OVERPASS_URLS:
            try:
                r = await client.post(url, data={"data": query})
                if r.status_code == 200:
                    return r.json()
            except Exception as e:
                last_exc = e
                continue
    raise HTTPException(status_code=502, detail="Overpass service error")

def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def extract_name(tags: dict) -> str:
    return tags.get("name") or tags.get("operator") or tags.get("brand") or "Unknown"

def extract_specialty(tags: dict) -> Optional[str]:
    return tags.get("healthcare:speciality") or tags.get("specialty")

def extract_contact(tags: dict) -> Tuple[Optional[str], Optional[str]]:
    phone = tags.get("phone") or tags.get("contact:phone")
    website = tags.get("website") or tags.get("contact:website")
    return phone, website

def extract_address(tags: dict) -> Optional[str]:
    parts = [
        tags.get("addr:housenumber"),
        tags.get("addr:street"),
        tags.get("addr:neighbourhood"),
        tags.get("addr:suburb"),
        tags.get("addr:city") or tags.get("addr:town") or tags.get("addr:village"),
        tags.get("addr:state"),
        tags.get("addr:postcode"),
        tags.get("addr:country")
    ]
    cleaned = [p for p in parts if p]
    return ", ".join(cleaned) if cleaned else None

@router.post("/nearby", response_model=NearbyResponse)
async def nearby_search(payload: NearbyRequest):
    # Determine coordinates
    if payload.latitude is not None and payload.longitude is not None:
        center = Coordinates(latitude=payload.latitude, longitude=payload.longitude)
    elif payload.address:
        center = await geocode_address(payload.address)
    else:
        raise HTTPException(status_code=400, detail="Provide either (latitude and longitude) or an address")

    radius_m = int(payload.radius_km * 1000)

    if MOCK_MODE:
        # Return a small, deterministic mock for frontend integration testing
        mock_docs = [
            Doctor(
                name="City General Hospital",
                specialty="general",
                phone="+91-9876543210",
                website=None,
                address="123 Health St, Sample City",
                coordinates=Coordinates(latitude=center.latitude + 0.005, longitude=center.longitude + 0.005),
                source="mock",
                distance_km=0.79,
            ),
            Doctor(
                name="Heart Care Center",
                specialty="cardiology",
                phone=None,
                website=None,
                address="456 Cardiac Ave, Sample City",
                coordinates=Coordinates(latitude=center.latitude - 0.004, longitude=center.longitude + 0.006),
                source="mock",
                distance_km=0.86,
            ),
        ]
        return NearbyResponse(center=center, radius_km=payload.radius_km, total=len(mock_docs), doctors=mock_docs)

    try:
        data = await fetch_overpass(center.latitude, center.longitude, radius_m, payload.limit)
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Overpass timeout, try reducing radius or limit")

    elements = data.get("elements", [])
    doctors: List[Doctor] = []
    for el in elements:
        tags = el.get("tags", {})
        if not tags:
            continue
        # Coordinate extraction for nodes/ways/relations
        if el.get("type") == "node":
            lat, lon = el.get("lat"), el.get("lon")
        else:
            center_obj = el.get("center")
            if not center_obj:
                continue
            lat, lon = center_obj.get("lat"), center_obj.get("lon")
        if lat is None or lon is None:
            continue

        name = extract_name(tags)
        specialty = extract_specialty(tags)
        phone, website = extract_contact(tags)
        addr = extract_address(tags)

        distance = haversine_km(center.latitude, center.longitude, lat, lon)
        doctors.append(Doctor(
            name=name,
            specialty=specialty,
            phone=phone,
            website=website,
            address=addr,
            coordinates=Coordinates(latitude=lat, longitude=lon),
            source="osm",
            distance_km=round(distance, 2)
        ))

    # Sort by distance for better UX
    doctors.sort(key=lambda d: (d.distance_km or 0))
    return NearbyResponse(
        center=center,
        radius_km=payload.radius_km,
        total=len(doctors),
        doctors=doctors
    )
