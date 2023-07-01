from fastapi import APIRouter, HTTPException, status, Header,Query
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel
from utils.database import UserCred
from utils.database import get_user_in_db,UserInDB
from passlib.context import CryptContext
from utils.database import User,register_user,get_users_in_db
router = APIRouter()

# JWT Settings
SECRET_KEY = "your-secret-key"  # Replace with your own secret key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 30

# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class userData(BaseModel):
    role:str
    fullName:str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    userData:userData


# Signup
async def signup(user:UserCred):
    return await register_user(user,"user")

# Login
async def login(user: User):
    user = await authenticate_user(user.email, user.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_data = {"sub": user.email}
    access_token = create_access_token(data={"sub": str(user.id),"email":user.email,"fullName":user.fullName,"role":user.role}, expires_delta=access_token_expires)
    refresh_token = create_refresh_token(refresh_token_data)
    return Token(access_token=access_token, refresh_token=refresh_token, token_type="bearer",userData=userData(fullName=user.fullName,role=user.role))
# Refresh Access Token
async def refresh_access_token(token: str):
    try:    
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        user = await get_user_in_db(email)
        print("user")
        if user:
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(data={"sub": str(user.id),"email":user.email,"fullName":user.fullName,"role":user.role}, expires_delta=access_token_expires)
            return {"access_token": access_token, "token_type": "bearer"}
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Authenticate user
async def authenticate_user(email: str, password: str):
    user = await get_user_in_db(email)  # Await the get_user function
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

# Verify user password
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Create access token
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Create refresh token
def create_refresh_token(data: dict):
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    data.update({"exp": expire})
    encoded_jwt = jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_user_by_token(token)->UserInDB:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    return await get_user_in_db(payload.get('email'))
    

# Verify access token for regular user
def verify_access_token_user(authorization: Optional[str] = Header(...)):
    if authorization is None or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    print(payload)
    # user_id = payload.get("sub")
    # Perform additional validation or authorization checks if needed
    # Example: validate_token(token)
    return token

# Verify access token for admin user
def verify_access_token_admin(authorization: Optional[str] = Header(...)):
    if authorization is None or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    if payload["role"] != "admin" and payload["role"]  != "ADMIN":
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    return token


async def get_users():
    users = await get_users_in_db()
    return {"length":len(users),"results":users}
