#!/usr/bin/env bash
set -euo pipefail

# Start the SUT separately: cd eshop-sut/backend && node server.js
# For repeatability, reset it before the run: cd eshop-sut/backend && node database.js
cd "$(dirname "$0")/.."
mkdir -p evidence/newman

newman run postman/HW06_API_Testing.postman_collection.json \
  -e postman/HW06.local.postman_environment.json \
  -d postman/data/fr-14/fr14-data.json \
  --folder "FR-14 — Category management (CRUD)" \
  -r cli,htmlextra \
  --reporter-htmlextra-export evidence/newman/fr14-newman-report.html
