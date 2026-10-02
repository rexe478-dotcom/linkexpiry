import secrets
from cryptography.fernet import Fernet, InvalidToken
from app.core.config import settings


def generate_secure_token(length_bytes: int = 16) -> str:
    """Generate a cryptographically secure URL-safe token."""
    return secrets.token_urlsafe(length_bytes)


def encrypt_message(plaintext: str, key: bytes | None = None) -> str:
    """
    Encrypt plaintext using authenticated encryption (Fernet - AES-128-CBC + HMAC-SHA256).
    Fails clearly if encryption key is missing or invalid.
    """
    if key is None:
        key = settings.get_encryption_key()
    fernet = Fernet(key)
    encrypted_bytes = fernet.encrypt(plaintext.encode("utf-8"))
    return encrypted_bytes.decode("utf-8")


def decrypt_message(ciphertext: str, key: bytes | None = None) -> str:
    """
    Decrypt authenticated ciphertext.
    Raises ValueError if decryption fails or ciphertext is tampered.
    """
    if key is None:
        key = settings.get_encryption_key()
    try:
        fernet = Fernet(key)
        decrypted_bytes = fernet.decrypt(ciphertext.encode("utf-8"))
        return decrypted_bytes.decode("utf-8")
    except InvalidToken as exc:
        raise ValueError("Decryption failed: corrupted data or invalid key") from exc


def generate_fernet_key() -> str:
    """Utility to generate a new valid Fernet key."""
    return Fernet.generate_key().decode("utf-8")
