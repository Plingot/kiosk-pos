#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status

echo "1️⃣ Setting up Buildx..."
docker buildx create --use --name multiarch-builder || true
docker buildx inspect --bootstrap

echo "2️⃣ Building and pushing single-arch images..."
docker buildx build --platform linux/arm64 -t alexanderwassbjer/kioskpos:arm64 --push .
docker buildx build --platform linux/amd64 -t alexanderwassbjer/kioskpos:amd64 --push .

echo "3️⃣ Creating the multi-arch manifest..."
docker buildx imagetools create \
  -t alexanderwassbjer/kioskpos:latest \
  alexanderwassbjer/kioskpos:amd64 \
  alexanderwassbjer/kioskpos:arm64

echo "4️⃣ Verifying multi-arch image..."
docker buildx imagetools inspect alexanderwassbjer/kioskpos:latest

echo "✅ All done!"