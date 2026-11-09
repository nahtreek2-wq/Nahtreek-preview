#!/bin/bash
# Production iOS archive. Release secrets (Apple Team ID, production Geoapify
# key) come from the environment — the Xcode project keeps fail-closed
# PLACEHOLDER values so live secrets are never committed.
#
# Usage:
#   PROD_TEAM_ID=ABC1234567 GEOAPIFY_API_KEY=live-key ./scripts/archive-release.sh
set -euo pipefail
: "${PROD_TEAM_ID:?Set PROD_TEAM_ID to the paid Apple Developer Team ID}"
: "${GEOAPIFY_API_KEY:?Set GEOAPIFY_API_KEY to the production Geoapify key}"
cd "$(dirname "$0")/.."
xcodebuild -workspace NahtreekClient.xcworkspace \
  -scheme NahtreekClient \
  -configuration Release \
  -archivePath "$PWD/build/NahtreekClient.xcarchive" \
  DEVELOPMENT_TEAM="$PROD_TEAM_ID" \
  GEOAPIFY_API_KEY="$GEOAPIFY_API_KEY" \
  archive
