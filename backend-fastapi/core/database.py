import motor.motor_asyncio
from core import config

# Create a Motor client
client = motor.motor_asyncio.AsyncIOMotorClient(config.MONGO_URI)

# Access your specific database by name.
# Replace "HealthAppDB" with your desired database name.
# MongoDB will create it automatically if it doesn't exist.
db = client["HealthAppDB"]