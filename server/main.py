from fastapi import FastAPI
from API.predict import detect_router


app = FastAPI()
app.include_router(detect_router)


@app.get("/")
def root():
    return {"Hello": "World"}
