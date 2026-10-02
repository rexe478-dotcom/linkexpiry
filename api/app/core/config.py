import os
import secrets
from pydantic_settings import BaseSettings, SettingsConfigDict
from cryptography.fernet import Fernet


class Settings(BaseSettings):
    app_name: str = "LinkExpiry"
    debug: bool = False
    database_url: str = "sqlite+aiosqlite:///./linkexpiry.db"
    message_encryption_key: str = "3OcDCnNvsIPMAId-yX7cKjdq5n8-ZigEcs4SF9VOP6E="
    frontend_origin: str = "http://localhost:5173"
    api_prefix: str = "/api"
    base_url: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=(".env", ".env.local", "../.env.local"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def async_database_url(self) -> str:
        url = self.database_url.strip()
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        
        # asyncpg uses ssl=require instead of sslmode=require
        if "sslmode=require" in url:
            url = url.replace("sslmode=require", "ssl=require")
        if "channel_binding=" in url:
            # strip channel_binding parameter for asyncpg compatibility if present
            import urllib.parse
            parsed = urllib.parse.urlparse(url)
            query_params = urllib.parse.parse_qs(parsed.query)
            query_params.pop("channel_binding", None)
            if "ssl" not in query_params and "sslmode" not in query_params:
                query_params["ssl"] = ["require"]
            new_query = urllib.parse.urlencode(query_params, doseq=True)
            url = urllib.parse.urlunparse(parsed._replace(query=new_query))
        return url

    def get_encryption_key(self) -> bytes:
        key = self.message_encryption_key.strip()
        if not key:
            raise ValueError(
                "MESSAGE_ENCRYPTION_KEY environment variable is required and cannot be empty."
            )
        return key.encode("utf-8")


settings = Settings()
