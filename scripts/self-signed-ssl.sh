#!/usr/bin/env bash
# Generates a self-signed SSL certificate for local development
# For production, use Let's Encrypt
mkdir -p ../nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ../nginx/ssl/key.pem \
  -out    ../nginx/ssl/cert.pem \
  -subj   "/C=IN/ST=State/L=City/O=VisionStick AI/CN=localhost"
echo "✅ Self-signed SSL cert created in nginx/ssl/"
