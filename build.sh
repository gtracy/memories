#!/bin/bash

# Remove the old zip
rm -f function.zip

# Prune dev dependencies to reduce size
echo "Pruning dev dependencies..."
npm prune --production

# Zip the function, excluding unnecessary files
echo "Creating function.zip..."
zip -r function.zip . -x "*.git*" -x "*.zip" -x "tests/*" -x "__mocks__/*" -x "vitest.config.js" -x "coverage/*" -x ".gitignore" -x ".env.json" -x ".env.json.me" -x "creds.json.me" -x "build.sh"

# Restore dev dependencies for local development
echo "Restoring dev dependencies..."
npm install

echo "Build complete. Checking size..."
ls -lh function.zip
