#!/usr/bin/env bash
# ============================================================
# VisionStick AI — Production Deploy Script
# Usage: ./deploy.sh
# ============================================================
set -euo pipefail

echo "╔══════════════════════════════════════════╗"
echo "║     VisionStick AI — Deploying...        ║"
echo "╚══════════════════════════════════════════╝"

# 1. Check required env file
if [ ! -f "backend/.env.production" ]; then
  echo "❌  backend/.env.production not found"
  echo "    Copy backend/.env.example → backend/.env.production and fill values"
  exit 1
fi

# 2. Check SSL certs
if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
  echo "⚠   SSL certs not found in nginx/ssl/"
  echo "    For dev: run ./scripts/self-signed-ssl.sh"
  echo "    For prod: use Let's Encrypt: certbot certonly --standalone -d yourdomain.com"
  echo "    Then copy fullchain.pem → nginx/ssl/cert.pem and privkey.pem → nginx/ssl/key.pem"
  echo ""
  echo "    Continuing with HTTP-only mode (port 80)..."
fi

# 3. Pull latest code
if [ -d ".git" ]; then
  echo "📥  Pulling latest code..."
  git pull origin main
fi

# 4. Build & start containers
echo "🐳  Building Docker images..."
docker compose build --no-cache

echo "🚀  Starting services..."
docker compose up -d

# 5. Wait for health
echo "⏳  Waiting for API to be healthy..."
sleep 5
for i in {1..12}; do
  if curl -sf http://localhost/health > /dev/null 2>&1; then
    echo "✅  API is healthy"
    break
  fi
  echo "   Retrying ($i/12)..."
  sleep 5
done

# 6. Summary
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║          Deploy Complete! 🎉             ║"
echo "╠══════════════════════════════════════════╣"
echo "║  App:     http://localhost               ║"
echo "║  API:     http://localhost/api           ║"
echo "║  Health:  http://localhost/health        ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Logs: docker compose logs -f backend"
