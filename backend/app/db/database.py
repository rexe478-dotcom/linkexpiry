from typing import AsyncGenerator, Optional
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base
from app.core.config import settings

DATABASE_URL = settings.database_url
Base = declarative_base()

is_sqlite = DATABASE_URL.startswith("sqlite")
is_memory = DATABASE_URL.startswith("memory") or DATABASE_URL == ":memory:"

engine = None
AsyncSessionLocal = None

if not is_memory and not is_sqlite:
    try:
        engine = create_async_engine(
            DATABASE_URL,
            echo=settings.debug,
            pool_pre_ping=True,
        )
        AsyncSessionLocal = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
        )
    except Exception:
        engine = None
        AsyncSessionLocal = None
else:
    try:
        connect_args = {"check_same_thread": False} if is_sqlite else {}
        engine = create_async_engine(
            DATABASE_URL,
            echo=settings.debug,
            connect_args=connect_args,
            pool_pre_ping=True,
        )
        AsyncSessionLocal = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
        )
    except Exception:
        engine = None
        AsyncSessionLocal = None


async def get_db() -> AsyncGenerator[Optional[AsyncSession], None]:
    if AsyncSessionLocal is not None:
        async with AsyncSessionLocal() as session:
            try:
                yield session
            finally:
                await session.close()
    else:
        yield None
