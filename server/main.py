from fastapi import FastAPI
from app.router.auth import router
from app.config.db import Base, engine

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(router, prefix="/auth", tags=["auth"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the ClassBuddy API"}
