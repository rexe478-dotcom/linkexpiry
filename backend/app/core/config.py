import os
import secrets
from pydantic_settings import BaseSettings, SettingsConfigDict
from cryptography.fernet import Fernet


class Settings(BaseSettings):
    app_name: str = "LinkExpiry"
    debug: bool = False
    database_url: str = "sqlite+aiosqlite:///./linkexpiry.db"
    message_encryption_key: str = ""
    frontend_origin: str = "http://localhost:5173"
    api_prefix: str = "/api"
    base_url: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    def get_encryption_key(self) -> bytes:
        key = self.message_encryption_key.strip()
        if not key:
            raise ValueError(
                "MESSAGE_ENCRYPTION_KEY environment variable is required and cannot be empty. "
                "Please generate a 32-byte urlsafe base64 key (e.g. using cryptography.fernet.Fernet.generate_key())."
            )
        return key.encode("utf-8")


settings = Settings()
