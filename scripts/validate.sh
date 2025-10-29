#!/bin/bash

# Validation script for Nidia Magic Composer
# Checks all required files and structure

set -e

echo "🔍 Validating Nidia Magic Composer structure..."

# Check required backend files
BACKEND_FILES=(
    "custom_components/nidia_magic_composer/__init__.py"
    "custom_components/nidia_magic_composer/manifest.json"
    "custom_components/nidia_magic_composer/config_flow.py"
    "custom_components/nidia_magic_composer/const.py"
    "custom_components/nidia_magic_composer/websocket.py"
    "custom_components/nidia_magic_composer/services.yaml"
    "custom_components/nidia_magic_composer/strings.json"
)

for file in "${BACKEND_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing: $file"
        exit 1
    fi
    echo "✅ Found: $file"
done

# Check frontend build exists
if [ ! -f "custom_components/nidia_magic_composer/panel/index.js" ]; then
    echo "❌ Frontend build missing. Run: cd frontend && npm run build"
    exit 1
fi
echo "✅ Frontend build exists"

# Validate manifest.json
if ! python3 -c "import json; json.load(open('custom_components/nidia_magic_composer/manifest.json'))" 2>/dev/null; then
    echo "❌ Invalid manifest.json"
    exit 1
fi
echo "✅ Valid manifest.json"

# Check HACS files
HACS_FILES=(
    "hacs.json"
    "README.md"
    "LICENSE"
)

for file in "${HACS_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing: $file"
        exit 1
    fi
    echo "✅ Found: $file"
done

echo ""
echo "✅ All validations passed!"
echo ""
echo "📦 Integration is ready for installation"
echo ""
echo "Next steps:"
echo "1. Commit changes: git add . && git commit -m 'Release v0.3.0'"
echo "2. Push to GitHub: git push origin main"
echo "3. Create a release tag: git tag v0.3.0 && git push origin v0.3.0"
echo "4. Install via HACS or manually in Home Assistant"
