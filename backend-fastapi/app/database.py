from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import os
from typing import Optional
from .models.patient import Patient
from .models.symptom_analysis import SymptomAnalysis
from .models.doctor import Doctor

class DatabaseManager:
    client: Optional[AsyncIOMotorClient] = None
    database = None

db_manager = DatabaseManager()

async def connect_to_mongo():
    """Create database connection"""
    try:
        mongodb_url = os.getenv("MONGODB_URI", "mongodb://localhost:27017/health-beacon")
        print(f"Connecting to MongoDB: {mongodb_url}")
        
        db_manager.client = AsyncIOMotorClient(mongodb_url)
        
        # Test the connection
        await db_manager.client.admin.command('ping')
        print("MongoDB connection successful")
        
        # Get database name from URL or default
        db_name = mongodb_url.split('/')[-1] if '/' in mongodb_url else "health-beacon"
        db_manager.database = db_manager.client[db_name]
        
        # Initialize Beanie with document models
        await init_beanie(
            database=db_manager.database,
            document_models=[Patient, SymptomAnalysis, Doctor]
        )
        print("Beanie initialized with document models")
        
        return db_manager.database
        
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        print("Falling back to in-memory storage...")
        return None

async def close_mongo_connection():
    """Close database connection"""
    if db_manager.client:
        db_manager.client.close()
        print("MongoDB connection closed")

def get_database():
    """Get current database instance"""
    return db_manager.database

async def check_db_health():
    """Check database health status"""
    if not db_manager.client:
        return {
            "status": "disconnected",
            "message": "Not connected to database"
        }
    
    try:
        # Ping the database
        await db_manager.client.admin.command('ping')
        server_info = await db_manager.client.server_info()
        
        return {
            "status": "connected",
            "version": server_info.get("version", "unknown"),
            "host": str(db_manager.client.address[0]) if db_manager.client.address else "unknown",
            "port": str(db_manager.client.address[1]) if db_manager.client.address else "unknown",
            "database": db_manager.database.name if db_manager.database else "unknown"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

async def seed_sample_data():
    """Seed sample data for development"""
    try:
        if db_manager.database is None:
            print("Skipping seed: no database connection")
            return
            
        # Check if we already have doctors
        doctor_count = await Doctor.count()
        if doctor_count > 0:
            print(f"Sample data already exists ({doctor_count} doctors), skipping seed...")
            return
            
        print("Seeding sample doctor data...")
        
        sample_doctors = [
            Doctor(
                name="Dr. Rajesh Kumar",
                specialty="general-practitioner",
                qualifications=[{
                    "degree": "MBBS",
                    "institution": "AIIMS Delhi",
                    "year": 2010,
                    "verified": True
                }],
                experience={"years": 14},
                contact={
                    "phone": "+91-9876543210",
                    "email": "dr.rajesh@healthbeacon.com"
                },
                location={
                    "hospital": {
                        "name": "City General Hospital",
                        "address": {
                            "street": "123 Health Street",
                            "city": "Mumbai",
                            "state": "Maharashtra",
                            "zipCode": "400001",
                            "country": "India"
                        },
                        "coordinates": {
                            "latitude": 19.0760,
                            "longitude": 72.8777
                        },
                        "type": "hospital"
                    },
                    "consultationModes": ["in-person", "online"]
                },
                fees={
                    "consultationFee": {
                        "inPerson": 800,
                        "online": 500
                    },
                    "currency": "INR",
                    "acceptsInsurance": True
                },
                ratings={
                    "average": 4.5,
                    "totalReviews": 142
                },
                verification={
                    "isVerified": True,
                    "licenseNumber": "MH2010GP001",
                    "medicalCouncil": "Maharashtra Medical Council"
                }
            ),
            Doctor(
                name="Dr. Priya Sharma",
                specialty="cardiology",
                qualifications=[{
                    "degree": "MD Cardiology",
                    "institution": "PGI Chandigarh",
                    "year": 2015,
                    "verified": True
                }],
                experience={"years": 9},
                contact={
                    "phone": "+91-9876543211",
                    "email": "dr.priya@healthbeacon.com"
                },
                location={
                    "hospital": {
                        "name": "Heart Care Center",
                        "address": {
                            "street": "456 Cardiac Avenue",
                            "city": "Delhi",
                            "state": "Delhi",
                            "zipCode": "110001",
                            "country": "India"
                        },
                        "coordinates": {
                            "latitude": 28.6139,
                            "longitude": 77.2090
                        },
                        "type": "private"
                    },
                    "consultationModes": ["in-person", "online"]
                },
                fees={
                    "consultationFee": {
                        "inPerson": 1500,
                        "online": 1000
                    },
                    "currency": "INR",
                    "acceptsInsurance": True
                },
                ratings={
                    "average": 4.8,
                    "totalReviews": 89
                },
                verification={
                    "isVerified": True,
                    "licenseNumber": "DL2015CARD001",
                    "medicalCouncil": "Delhi Medical Council"
                }
            )
        ]
        
        for doctor in sample_doctors:
            await doctor.save()
            
        print(f"Seeded {len(sample_doctors)} sample doctors")
        
    except Exception as e:
        print(f"Error seeding sample data: {e}")