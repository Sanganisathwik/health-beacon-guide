from dotenv import load_dotenv
import os

# Load environment variables FIRST before any other imports
# Get the path to the .env file (one directory up from app)
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from .routers import nearby
from .routers import health, symptoms, patients
from .database import connect_to_mongo, close_mongo_connection, seed_sample_data
app = FastAPI(title="Health Beacon API", version="1.0.0")

# CORS
cors_env = os.getenv("CORS_ORIGINS", "*")
allowed_origins = [o.strip() for o in cors_env.split(",") if o.strip()] or ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Events
@app.on_event("startup")
async def startup_event():
    """Initialize application"""
    print("Health Beacon API started successfully")

@app.on_event("shutdown")
async def shutdown_event():
    """Clean shutdown"""
    print("Health Beacon API shutdown")

# Routers
app.include_router(health.router, prefix="/api", tags=["health"]) 
app.include_router(nearby.router, prefix="/api/doctors", tags=["doctors"]) 
app.include_router(symptoms.router, prefix="/api/symptoms", tags=["symptoms"]) 
app.include_router(patients.router, prefix="/api/patients", tags=["patients"]) 

@app.get("/")
async def root():
    return {
        "message": "Welcome to Health Beacon API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/api/health",
            "health_check": "/api/health-check",
            "symptoms": "/api/symptoms",
            "doctors": "/api/doctors", 
            "patients": "/api/patients"
        }
    }
