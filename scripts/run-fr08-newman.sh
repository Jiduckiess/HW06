#!/usr/bin/env bash
set -euo pipefail

# Start the SUT separately in another terminal: cd eshop-sut/backend && node server.js
# For a clean, repeatable run, reset it first: cd eshop-sut/backend && node database.js
cd "$(dirname "$0")/.."
mkdir -p evidence/newman

newman run postman/HW06_API_Testing.postman_collection.json \
  -e postman/HW06.local.postman_environment.json \
  -d postman/data/fr-08/fr08-data.json \
  --folder "FR-08 — Checkout" \
  -r cli,htmlextra \
  --reporter-htmlextra-export evidence/newman/fr08-newman-report.html
