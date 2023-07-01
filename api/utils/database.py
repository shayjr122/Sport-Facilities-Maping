from databases import Database
from pydantic import BaseModel
from passlib.context import CryptContext
from typing import List
# Database Settings
DATABASE_URL = "sqlite:///./users.db"

# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Database Connection
database = Database(DATABASE_URL)

class User4update(BaseModel):
    email: str
    fullName:str
    role:str

class User(BaseModel):
    email: str
    password: str

class UserCred(BaseModel):
    email: str
    fullName:str
    password: str


class UserInDB(BaseModel):
    id: int
    email: str
    fullName: str
    hashed_password: str
    role:str

# Create users table
async def create_user_table_if_not_exist():
    query = """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            fullName TEXT NOT NULL,
            hashed_password TEXT NOT NULL,
            role TEXT NOT NULL
        );
    """
    await database.execute(query=query)


async def create_liked_table_if_not_exist():
    query = """
        CREATE TABLE IF NOT EXISTS liked (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            facility_id TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        );
    """
    await database.execute(query=query)






# User Like function
async def create_facility_liked(user_id: int, facility_id: str):
    result = await get_user_facility(user_id)
    for res in result:
        if res == facility_id:
            return
    insert_query = "INSERT INTO liked (user_id, facility_id) VALUES (:user_id, :facility_id)"
    insert_values = {"user_id": user_id, "facility_id": facility_id}
    await database.execute(query=insert_query, values=insert_values)

async def unlike(user_id: int, facility_id: str):
    query = "DELETE FROM liked WHERE user_id = :user_id AND facility_id = :facility_id"
    values = {"user_id": user_id, "facility_id": facility_id}
    print(query,values)
    s= await database.execute(query=query, values=values)
    print(s)


# Get user facility function
async def get_user_facility(user_id: int):
    query = "SELECT facility_id FROM liked WHERE user_id = :user_id"
    values = {"user_id": user_id}
    result = await database.fetch_all(query=query, values=values)
    return [record["facility_id"] for record in result]


async def create_default_admin_user():
    user = UserCred(email="admin@admin.com",fullName='Admin',password="Aa123456")
    await register_user(user=user,role="admin")

async def update_user_roles(users:List[User4update]):
    for user in users:
        query = "UPDATE users SET role = :role WHERE email = :email"
        values = {"role": user.role, "email": user.email}
        await database.execute(query=query, values=values)


async def delete_users(users:List[User4update]):
    for user in users:
        query = "DELETE FROM users WHERE email = :email" 
        values = {"email": user.email}   
        await database.execute(query=query, values=values)

async def get_users_in_db():
    users=[]
    query = "SELECT * FROM users"
    results = await database.fetch_all(query=query)
    if results:
        for result in results:
            users.append({"email":result["email"],"fullName":result["fullName"],"role":result["role"]})
        return users
    
# Get user from the database
async def get_user_in_db(email: str)->UserInDB:
    query = "SELECT * FROM users WHERE email = :email"
    values = {"email": email}
    result = await database.fetch_one(query=query, values=values)
    if result:
        return UserInDB(id=result["id"], email=result["email"],fullName=result["fullName"] ,hashed_password=result["hashed_password"],role=result["role"])


# Register User
async def register_user(user: UserCred,role:str):
    user_db = await get_user_in_db(user.email)
    if user_db:
        return {"message": "User alrady exist"}    
    hashed_password = pwd_context.hash(user.password)
    query = "INSERT INTO users (email, fullName, hashed_password, role) VALUES (:email, :fullName, :hashed_password, :role)"
    values = {"email": user.email, "fullName":user.fullName,"hashed_password": hashed_password, "role":role}
    await database.execute(query=query, values=values)
    return {"message": "User created successfully"}
