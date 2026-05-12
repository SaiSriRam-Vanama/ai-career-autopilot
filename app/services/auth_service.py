"""
Authentication service with JWT and bcrypt.
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings
from app.database import get_users_collection
from app.database.models import UserModel, UserCreate


# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Bearer token
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


async def get_user_by_email(email: str) -> Optional[dict]:
    """Get user by email."""
    users_collection = get_users_collection()
    user = await users_collection.find_one({"email": email})
    return user


async def create_user(user_data: UserCreate) -> dict:
    """Create a new user."""
    users_collection = get_users_collection()
    
    # Check if user already exists
    existing_user = await get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user document
    user_dict = {
        "email": user_data.email,
        "hashed_password": get_password_hash(user_data.password),
        "full_name": user_data.full_name,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    
    result = await users_collection.insert_one(user_dict)
    user_dict["_id"] = result.inserted_id
    
    return user_dict


async def authenticate_user(email: str, password: str) -> Optional[dict]:
    """Authenticate user with email and password."""
    user = await get_user_by_email(email)
    if not user:
        return None
    if not verify_password(password, user["hashed_password"]):
        return None
    return user


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Get current authenticated user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        # Log that we received a request
        with open("debug_auth.log", "a") as f:
            f.write(f"{datetime.utcnow()} - Auth Check Token prefix: {token[:10]}...\n")
            
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        email: str = payload.get("sub")
        
        if email is None:
            with open("debug_auth.log", "a") as f:
                f.write(f"{datetime.utcnow()} - Auth Failed: Email is None in payload\n")
            raise credentials_exception
            
    except JWTError as e:
        with open("debug_auth.log", "a") as f:
            f.write(f"{datetime.utcnow()} - Auth Failed JWTError: {e}\n")
        raise credentials_exception
    except Exception as e:
        with open("debug_auth.log", "a") as f:
            f.write(f"{datetime.utcnow()} - Auth Failed Critical Error: {e}\n")
        raise credentials_exception
    
    user = await get_user_by_email(email)
    if user is None:
        with open("debug_auth.log", "a") as f:
            f.write(f"{datetime.utcnow()} - Auth Failed: User not found for email {email}\n")
        raise credentials_exception
    
    with open("debug_auth.log", "a") as f:
        f.write(f"{datetime.utcnow()} - Auth Success: {email}\n")
        
    return user
