from fastapi import APIRouter
import os
import platform
import time
try:
    import psutil  # type: ignore
except Exception:  # pragma: no cover
    psutil = None

router = APIRouter()

start_time = time.time()

def _service_status():
    return {
        "geminiAI": {
            "status": "configured" if os.getenv("GEMINI_API_KEY") else "not-configured",
            "message": "Gemini AI service ready" if os.getenv("GEMINI_API_KEY") else "Gemini API key not found",
        },
        "osm": {
            "status": "configured",
            "message": "Using OpenStreetMap (Nominatim + Overpass)",
        },
        "database": {
            "status": "not-implemented",
            "message": "Using in-memory storage (implement DB for production)",
        },
    }

@router.get("/health")
async def simple_health():
    return {
        "status": "success",
        "message": "Health Beacon API is running",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "environment": os.getenv("ENV", "development"),
    }

@router.get("/health-check")
async def detailed_health():
    mem = psutil.virtual_memory() if psutil else None
    return {
        "status": "healthy",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "uptime": time.time() - start_time,
        "environment": os.getenv("ENV", "development"),
        "version": "1.0.0",
        "services": _service_status(),
        "system": {
            "pythonVersion": platform.python_version(),
            "platform": platform.system().lower(),
            "architecture": platform.machine(),
            "memory": ({
                "total": f"{int(mem.total/1024/1024)} MB",
                "available": f"{int(mem.available/1024/1024)} MB",
                "used": f"{int(mem.used/1024/1024)} MB",
            } if mem else None),
            "cpus": (psutil.cpu_count(logical=True) if psutil else None),
            "loadAverage": (psutil.getloadavg() if (psutil and hasattr(psutil, 'getloadavg')) else [0,0,0]),
        },
        "endpoints": {
            "symptoms": "/api/symptoms",
            "doctors": "/api/doctors",
            "patients": "/api/patients",
            "health": "/api/health"
        }
    }

@router.get("/health-check/ping")
async def ping():
    return {"status": "success", "message": "pong"}

@router.get("/health-check/ready")
async def ready():
    # Add real readiness checks here if needed
    return {"status": "ready", "message": "Service is ready to handle requests"}

@router.get("/health-check/live")
async def live():
    return {"status": "alive", "uptime": time.time() - start_time}
