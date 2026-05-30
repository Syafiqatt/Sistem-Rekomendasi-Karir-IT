#!/bin/bash
set -e

cd backend
python3 -m uvicorn ai_api:app --host 0.0.0.0 --port 8000 &

echo "Waiting for AI service..."
sleep 10

node server.js
