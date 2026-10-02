import asyncio
import pytest
from httpx import AsyncClient, ASGITransport
from datetime import datetime, timedelta, timezone

from app.main import app
from app.core.config import settings
from app.core.security import generate_fernet_key
import app.services.message_service as msg_service


@pytest.fixture(autouse=True)
def setup_encryption_key():
    if not settings.message_encryption_key:
        settings.message_encryption_key = generate_fernet_key()


@pytest.mark.asyncio
async def test_1_message_creation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/messages",
            json={"message": "Secret credentials 123", "expiration_minutes": 60}
        )
        assert response.status_code == 201
        data = response.json()
        assert "token" in data
        assert "expires_at" in data
        assert "url" in data
        assert "message" not in data  # Never return plaintext


@pytest.mark.asyncio
async def test_2_empty_message_rejection():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/messages",
            json={"message": "   ", "expiration_minutes": 60}
        )
        assert response.status_code == 422
        data = response.json()
        assert "detail" in data


@pytest.mark.asyncio
async def test_3_oversized_message_rejection():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        oversized = "a" * 501
        response = await client.post(
            "/api/messages",
            json={"message": oversized, "expiration_minutes": 60}
        )
        assert response.status_code == 422
        data = response.json()
        assert "detail" in data


@pytest.mark.asyncio
async def test_4_invalid_expiration_rejection():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/messages",
            json={"message": "Valid secret", "expiration_minutes": 45}  # 45 is not supported
        )
        assert response.status_code == 422
        data = response.json()
        assert "detail" in data


@pytest.mark.asyncio
async def test_5_successful_status_retrieval():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        create_res = await client.post(
            "/api/messages",
            json={"message": "Status test message", "expiration_minutes": 10}
        )
        token = create_res.json()["token"]

        status_res = await client.get(f"/api/messages/{token}")
        assert status_res.status_code == 200
        data = status_res.json()
        assert data["status"] == "available"
        assert "expires_at" in data
        assert "message" not in data


@pytest.mark.asyncio
async def test_6_successful_reveal():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        secret_text = "WiFi password: MySuperSecretPassword123"
        create_res = await client.post(
            "/api/messages",
            json={"message": secret_text, "expiration_minutes": 60}
        )
        token = create_res.json()["token"]

        reveal_res = await client.post(f"/api/messages/{token}/reveal")
        assert reveal_res.status_code == 200
        data = reveal_res.json()
        assert data["message"] == secret_text
        assert "viewed_at" in data
        assert "expires_at" in data


@pytest.mark.asyncio
async def test_7_second_reveal_rejection():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        create_res = await client.post(
            "/api/messages",
            json={"message": "One time only", "expiration_minutes": 60}
        )
        token = create_res.json()["token"]

        # First reveal succeeds
        first_reveal = await client.post(f"/api/messages/{token}/reveal")
        assert first_reveal.status_code == 200

        # Second reveal fails
        second_reveal = await client.post(f"/api/messages/{token}/reveal")
        assert second_reveal.status_code in [400, 410]
        data = second_reveal.json()
        assert data["detail"] == "This message has already been viewed"

        # Status check shows viewed
        status_res = await client.get(f"/api/messages/{token}")
        assert status_res.json()["status"] == "viewed"


@pytest.mark.asyncio
async def test_8_expired_message_rejection():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        create_res = await client.post(
            "/api/messages",
            json={"message": "Will expire immediately", "expiration_minutes": 10}
        )
        token = create_res.json()["token"]

        # Manually expire the message in storage
        if token in msg_service._memory_store:
            msg_service._memory_store[token]["expires_at"] = datetime.now(timezone.utc) - timedelta(minutes=1)

        # Status check shows expired
        status_res = await client.get(f"/api/messages/{token}")
        assert status_res.json()["status"] == "expired"

        # Reveal attempt fails
        reveal_res = await client.post(f"/api/messages/{token}/reveal")
        assert reveal_res.status_code in [400, 410]
        assert reveal_res.json()["detail"] == "This message has expired"


@pytest.mark.asyncio
async def test_9_invalid_token():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        status_res = await client.get("/api/messages/non_existent_token_12345")
        assert status_res.status_code == 200
        assert status_res.json()["status"] == "not_found"

        reveal_res = await client.post("/api/messages/non_existent_token_12345/reveal")
        assert reveal_res.status_code == 404
        assert reveal_res.json()["detail"] == "Message not found"


@pytest.mark.asyncio
async def test_10_concurrent_reveal_attempts():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        create_res = await client.post(
            "/api/messages",
            json={"message": "High concurrency test", "expiration_minutes": 60}
        )
        token = create_res.json()["token"]

        # Launch 10 simultaneous reveal requests
        tasks = [client.post(f"/api/messages/{token}/reveal") for _ in range(10)]
        results = await asyncio.gather(*tasks)

        # Exactly ONE request must succeed (status 200)
        successes = [r for r in results if r.status_code == 200]
        failures = [r for r in results if r.status_code in (400, 410)]

        assert len(successes) == 1, f"Expected exactly 1 success, got {len(successes)}"
        assert len(failures) == 9
        assert successes[0].json()["message"] == "High concurrency test"
