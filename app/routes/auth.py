"""
Authentication routes for user registration and login.
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.database.models import UserCreate, UserLogin, Token
from app.services.auth_service import create_user, authenticate_user, create_access_token
from datetime import datetime


router = APIRouter(prefix="/auth", tags=["Authentication"])


class GoogleLoginRequest(BaseModel):
    credential: str


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """
    Register a new user.
    
    - **email**: Valid email address
    - **password**: User password (will be hashed)
    - **full_name**: Optional full name
    """
    try:
        user = await create_user(user_data)
        
        # Create access token
        access_token = create_access_token(data={"sub": user["email"]})
        
        return {"access_token": access_token, "token_type": "bearer", "user": user}
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    """
    Login with email and password.
    
    - **email**: Registered email address
    - **password**: User password
    
    Returns JWT access token.
    """
    user = await authenticate_user(user_data.email, user_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user["email"]})
    
    # Prepare user data for response
    user_response = {
        "id": str(user.get("_id", "")),
        "email": user["email"],
        "full_name": user.get("full_name", "")
    }
    
    return {"access_token": access_token, "token_type": "bearer", "user": user_response}


@router.post("/google", response_model=Token)
async def google_login(request: GoogleLoginRequest):
    """
    Authenticate with Google OAuth.
    
    - **credential**: Google OAuth credential (JWT token from Google)
    
    Returns JWT access token and user data.
    """
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests
        from app.config import settings
        
        # Verify the Google token
        # Note: You need to set GOOGLE_CLIENT_ID in your environment
        google_client_id = settings.GOOGLE_CLIENT_ID
        
        if not google_client_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google OAuth not configured. Please set GOOGLE_CLIENT_ID environment variable."
            )
        
        try:
            # Verify the token
            idinfo = id_token.verify_oauth2_token(
                request.credential, 
                requests.Request(), 
                google_client_id
            )
            
            # Extract user info from Google token
            email = idinfo.get('email')
            name = idinfo.get('name')
            picture = idinfo.get('picture')
            
            if not email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email not provided by Google"
                )
            
            # Check if user exists, if not create them
            from app.database import get_database
            db = get_database()
            users_collection = db.users
            
            user = await users_collection.find_one({"email": email})
            
            if not user:
                # Create new user from Google data
                new_user = {
                    "email": email,
                    "full_name": name or email.split('@')[0],
                    "profile_picture": picture,
                    "auth_provider": "google",
                    "is_active": True
                }
                result = await users_collection.insert_one(new_user)
                new_user["_id"] = str(result.inserted_id)
                user = new_user
            else:
                user["_id"] = str(user["_id"])
            
            # Create access token
            access_token = create_access_token(data={"sub": email})
            
            # Remove sensitive data
            user_data = {
                "id": user["_id"],
                "email": user["email"],
                "full_name": user.get("full_name", ""),
                "profile_picture": user.get("profile_picture")
            }
            
            return {
                "access_token": access_token, 
                "token_type": "bearer",
                "user": user_data
            }
            
        except ValueError as e:
            # Invalid token
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid Google token: {str(e)}"
            )
    
    except HTTPException as e:
        raise e
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google authentication failed: {str(e)}"
        )


from app.services.auth_service import get_current_user
from fastapi import Depends
from app.database import get_users_collection
from app.database.models import UserUpdate
from bson import ObjectId

@router.put("/profile", response_model=dict)
async def update_profile(
    update_data: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile details."""
    try:
        user_id = current_user["_id"]
        collection = get_users_collection()
        
        # Filter out None values
        update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
        
        if not update_dict:
            return {"message": "No changes provided"}
            
        update_dict["updated_at"] = datetime.utcnow()
        
        await collection.update_one(
            {"_id": user_id},
            {"$set": update_dict}
        )
        
        # Return updated user
        updated_user = await collection.find_one({"_id": user_id})
        updated_user["_id"] = str(updated_user["_id"])
        # Remove sensitivity
        if "hashed_password" in updated_user:
            del updated_user["hashed_password"]
            
        return {"message": "Profile updated", "user": updated_user}

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/me", response_model=dict)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile."""
    # current_user is already fetched from DB by dependency
    # Convert ObjectId to string
    current_user["_id"] = str(current_user["_id"])
    if "hashed_password" in current_user:
        del current_user["hashed_password"]
    return current_user
