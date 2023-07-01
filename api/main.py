from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from utils.database import database,create_user_table_if_not_exist,create_default_admin_user,create_liked_table_if_not_exist

app = FastAPI()



# Import routes
from routes.user_route import router as user_router
from routes.facilities_route import router as facilities_route

# Include the user router
app.include_router(user_router, tags=["User"])
app.include_router(facilities_route, tags=["Facilities"])
origins = [
    "*"
    # "http://localhost",
    # "http://localhost:3000",
    # Add more allowed origins as needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database and tables on startup
@app.on_event("startup")
async def startup():
    await database.connect()
    await create_user_table_if_not_exist()
    await create_liked_table_if_not_exist()
    await create_default_admin_user()


# Close database connection on shutdown
@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()
