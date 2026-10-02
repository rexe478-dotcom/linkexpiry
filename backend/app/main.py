import sys
import os

# Guarantee root backend directory is in sys.path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.api.routes.messages import router as messages_router
from app.db.database import engine, Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    if engine is not None:
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
        except Exception:
            pass
    yield
    if engine is not None:
        try:
            await engine.dispose()
        except Exception:
            pass


app = FastAPI(
    title=settings.app_name,
    description="Minimal one-page temporary-message application backend API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

origins = [
    settings.frontend_origin,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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


@app.get("/health", tags=["system"])
async def health_check():
    return {"status": "healthy", "service": settings.app_name}


app.include_router(messages_router, prefix=settings.api_prefix)
