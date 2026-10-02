#!/bin/bash
PORT="${PORT:-10000}"
echo "Starting LinkExpiry Uvicorn server on port $PORT..."
exec uvicorn server:app --host 0.0.0.0 --port "$PORT" --loop asyncio
