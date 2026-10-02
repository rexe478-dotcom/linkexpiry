import os
import sys

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.messages import router as messages_router
from app.core.config import settings

app = FastAPI(title="LinkExpiry API")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"status": "healthy", "service": "LinkExpiry", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "LinkExpiry"}


app.include_router(messages_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", "10000"))
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
