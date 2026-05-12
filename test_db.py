
import asyncio
from app.database import connect_to_mongo, close_mongo_connection, get_users_collection

async def test_db():
    print("Testing DB connection...")
    try:
        await connect_to_mongo()
        col = get_users_collection()
        count = await col.count_documents({})
        print(f"Connection Successful! User count: {count}")
    except Exception as e:
        print(f"Connection Failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(test_db())
