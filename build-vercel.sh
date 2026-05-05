#!/bin/bash
set -e

echo "=== Building backend ==="
cd test/backend
npm install
npm run build

echo "=== Building frontend ==="
cd ../frontend
NODE_ENV=development npm install --legacy-peer-deps
./node_modules/.bin/ng build --configuration production