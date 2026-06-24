#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PORTAL_DIR="$ROOT_DIR/apps/portal"
OUTPUT_DIR="$ROOT_DIR/deploy/ionos/upload/nuviobridge"
STANDALONE_DIR="$PORTAL_DIR/.next/standalone"

cd "$ROOT_DIR"

echo "Building Bridge for https://www.nuviobridge.com"
NEXT_PUBLIC_SITE_URL="https://www.nuviobridge.com" npm run build --workspace=portal

rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

cp -R "$STANDALONE_DIR/." "$OUTPUT_DIR/"

mkdir -p "$OUTPUT_DIR/apps/portal/.next"
cp -R "$PORTAL_DIR/.next/static" "$OUTPUT_DIR/apps/portal/.next/static"

if [ -d "$PORTAL_DIR/public" ]; then
  cp -R "$PORTAL_DIR/public" "$OUTPUT_DIR/apps/portal/public"
fi

cp "$ROOT_DIR/deploy/ionos/nuviobridge.service" "$OUTPUT_DIR/"
cp "$ROOT_DIR/deploy/ionos/nuviobridge.nginx.conf" "$OUTPUT_DIR/"
cp "$ROOT_DIR/deploy/ionos/.env.production.example" "$OUTPUT_DIR/"

echo
echo "Upload package ready:"
echo "$OUTPUT_DIR"
echo
echo "Upload the CONTENTS of this folder with FileZilla to:"
echo "/var/www/nuviobridge"
