from fastapi import APIRouter,Query,Depends
from utils.user_managment import verify_access_token_user,get_user_by_token
from utils.database import create_facility_liked,UserInDB,unlike
from utils.gov_aggregation_layer import get_facility_by_filter,get_facility_liked
router = APIRouter()



# API to locate facilities based on free search text and filters
@router.get("/facilities/filter",tags=["Facilities"])
def filters_search_facilities(filters: str = Query(...), limit: str = Query(...), offset: str = Query(...),token: str = Depends(verify_access_token_user)):
    results = get_facility_by_filter(filters=filters, limit=limit, offset=offset)
    return {"length": len(results), "results": results}

# API to locate facilities based on free search text and filters
@router.get("/facilities/like",tags=["Facilities"])
async def get_like(token: str = Depends(verify_access_token_user)):
    user=await get_user_by_token(token)
    results = await get_facility_liked(user_id=user.id)
    return {"length": len(results), "results": results}

@router.post("/facilities/like",tags=["Facilities"])
async def like(facility_id:str,token: str = Depends(verify_access_token_user)):
    user=await get_user_by_token(token)
    print("user",user)
    await create_facility_liked(user_id=user.id,facility_id=facility_id)
    return "like was registerd"

@router.delete("/facilities/unlike",tags=["Facilities"])
async def unlike_facility(facility_id:str,token: str = Depends(verify_access_token_user)):
    user=await get_user_by_token(token)
    print("user",user)
    await unlike(user_id=user.id,facility_id=facility_id)
    return "like was removed"


