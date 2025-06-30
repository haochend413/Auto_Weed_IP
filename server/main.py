from fastapi import FastAPI
from server.API.run import model_router


app = FastAPI()
app.include_router(model_router)


@app.get("/")
def root():
    return {"Auto Weed Image Processing"}
