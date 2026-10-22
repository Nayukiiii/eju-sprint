#!/usr/bin/env bash
# Rebuild vendor/anthropic-sdk.js: a single-file ES module of the Anthropic SDK for the browser.
# Usage: tools/build_sdk_bundle.sh [sdk-version]
set -euo pipefail
VERSION="${1:-0.132.0}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
cp "$ROOT/tools/vendor-src/anthropic-sdk-entry.mjs" "$WORK/entry.mjs"
cd "$WORK"
npm init -y >/dev/null
npm install --silent "@anthropic-ai/sdk@$VERSION" esbuild@0.25.10 >/dev/null
npx esbuild entry.mjs --bundle --format=esm --platform=browser --target=es2020 --minify \
  --legal-comments=eof --banner:js="/* @anthropic-ai/sdk $VERSION (MIT) — browser bundle */" \
  --outfile="$ROOT/vendor/anthropic-sdk.js"
echo "built vendor/anthropic-sdk.js from @anthropic-ai/sdk@$VERSION"
