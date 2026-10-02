import sys
import os

# Guarantee root backend directory is in sys.path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.api.routes.messages import router as messages_router


app = FastAPI(
    title=settings.app_name,
    description="Minimal one-page temporary-message application backend API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    detail = "Validation error"
    if errors:
        first_err = errors[0]
        msg = first_err.get("msg", "")
        if "Value error, " in msg:
            detail = msg.replace("Value error, ", "")
        else:
            detail = msg or "Invalid request parameters"
    return JSONResponse(
        status_code=422,
        content={"detail": detail},
    )


@app.get("/", tags=["system"])
@app.get("/api", tags=["system"])
async def root_health():
    return {"status": "healthy", "service": settings.app_name, "version": "1.0.0"}


@app.get("/health", tags=["system"])
@app.get("/api/health", tags=["system"])
async def health_check():
    return {"status": "healthy", "service": settings.app_name}


app.include_router(messages_router, prefix="/api")
app.include_router(messages_router, prefix="")
