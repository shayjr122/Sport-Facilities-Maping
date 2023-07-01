from fastapi import APIRouter, Depends, HTTPException, status, Header
from utils.database import update_user_roles
from utils.user_managment import get_users,get_user_by_token
from utils.database import UserCred,delete_users
from utils.user_managment import login,User,refresh_access_token,verify_access_token_user,verify_access_token_admin,signup
from utils.database import User,User4update
from typing import List

router = APIRouter()


@router.post("/user/login")
async def login_for_access_token(user: User):
    return await login(user=user)

@router.get("/user/refresh")
async def refresh(token: str):
    return await refresh_access_token(token=token)

@router.post("/user/signup")
async def signup_user(user: UserCred):
    return await signup(user=user)


@router.get("/user")
async def refresh(token: str = Depends(verify_access_token_user)):
    user=await get_user_by_token(token)
    print("user",user)
    return {"length":1,"results":[user]}



@router.get("/admin/users")
async def get_users_list(token: str = Depends(verify_access_token_admin)):
    return await get_users()


@router.post("/admin/users")
async def post_users_list(users:List[User4update],token: str = Depends(verify_access_token_admin)):
    await update_user_roles(users)
    return "users updated successfully"

@router.delete("/admin/users")
async def delete_users_list(users:List[User4update],token: str = Depends(verify_access_token_admin)):
    await delete_users(users)
    return "users deleted successfully"



