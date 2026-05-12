
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import certifi
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGODB_URL")

async def test_force_connect():
    print(f"Testing connection to: {MONGO_URL.split('@')[1] if '@' in MONGO_URL else 'HIDDEN'}")
    print("Attempting with tlsAllowInvalidCertificates=True and certifi...")
    
    try:
        client = AsyncIOMotorClient(
            MONGO_URL,
            tlsCAFile=certifi.where(),
            tlsAllowInvalidCertificates=True,
            serverSelectionTimeoutMS=5000
        )
        
        # Force a command to verify connection
        print("Sending ping...")
        await client.admin.command('ping')
        print("✅ SUCCESS: Connection established and pinged!")
    except Exception as e:
        print(f"❌ FAILED: {e}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(test_force_connect())
