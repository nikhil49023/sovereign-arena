#!/usr/bin/env bash

# Sovereign Arena 1-Click Launch Script
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "⚔️  Starting Sovereign Arena..."
echo "🔌 Starting Backend Server (Port 3001)..."
node server/server.js &
SERVER_PID=$!

echo "💻 Starting Frontend Client..."
(cd client && npm run dev) &
CLIENT_PID=$!

trap "kill $SERVER_PID $CLIENT_PID 2>/dev/null || true" EXIT INT TERM

wait
