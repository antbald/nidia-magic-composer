# Installation Guide

## Prerequisites

- Home Assistant 2024.1.0 or later
- HACS installed (recommended) or manual installation capability
- Git (for development)

## Method 1: HACS Installation (Recommended)

### Step 1: Add Custom Repository

1. Open Home Assistant
2. Navigate to **HACS** → **Integrations**
3. Click the three dots (⋮) in the top right
4. Select **Custom repositories**
5. Add the repository:
   - **Repository**: `https://github.com/antoniobaldassarre/nidia-magic-composer`
   - **Category**: `Integration`
6. Click **Add**

### Step 2: Install Integration

1. Search for "Nidia Magic Composer" in HACS
2. Click on it and select **Download**
3. Restart Home Assistant

### Step 3: Configure Integration

1. Go to **Settings** → **Devices & Services**
2. Click **+ Add Integration**
3. Search for "Nidia Magic Composer"
4. Follow the configuration flow:
   - Enter a profile name (e.g., "My Home")
   - Enable advanced features if needed
5. Click **Submit**

### Step 4: Access the Wizard

1. Look for **Magic Composer** in your Home Assistant sidebar
2. Click to open the wizard interface
3. Start configuring your home!

---

## Method 2: Manual Installation

### Step 1: Download

Download the latest release from GitHub:

```bash
cd /config
wget https://github.com/antoniobaldassarre/nidia-magic-composer/releases/latest/download/nidia_magic_composer.zip
```

Or clone the repository:

```bash
cd /config/custom_components
git clone https://github.com/antoniobaldassarre/nidia-magic-composer.git
cd nidia-magic-composer
```

### Step 2: Build Frontend (if cloning)

If you cloned the repository, you need to build the frontend:

```bash
cd frontend
npm install
npm run build
cd ..
```

### Step 3: Copy Files

Extract or copy the integration to your custom_components directory:

```bash
# If downloaded as zip
unzip nidia_magic_composer.zip -d /config/custom_components/

# If cloned
cp -r custom_components/nidia_magic_composer /config/custom_components/
```

### Step 4: Restart Home Assistant

Restart Home Assistant to load the integration.

### Step 5: Configure

Follow steps 3-4 from Method 1 above.

---

## Verification

After installation, verify the integration is loaded:

1. Check **Settings** → **System** → **Logs** for any errors related to `nidia_magic_composer`
2. Confirm the integration appears in **Settings** → **Devices & Services**
3. Verify the sidebar shows **Magic Composer**

### Expected Files

Your `custom_components/nidia_magic_composer/` directory should contain:

```
nidia_magic_composer/
├── __init__.py
├── config_flow.py
├── const.py
├── manifest.json
├── services.yaml
├── strings.json
├── websocket.py
└── panel/
    ├── index.html
    ├── index.js
    └── assets/
        └── index-*.css
```

---

## Troubleshooting

### Integration Not Appearing

- Verify files are in `/config/custom_components/nidia_magic_composer/`
- Check Home Assistant logs for errors
- Ensure you restarted Home Assistant after installation
- Clear browser cache and refresh

### Panel Not Loading

- Check browser console for JavaScript errors
- Verify frontend build files exist in `panel/` directory
- Ensure `index.js` was generated correctly
- Try rebuilding frontend: `cd frontend && npm run build`

### WebSocket Errors

- Check Home Assistant logs for WebSocket connection issues
- Verify integration is properly loaded
- Restart Home Assistant

### Config Flow Errors

- Check Home Assistant version (must be 2024.1.0+)
- Review logs for detailed error messages
- Ensure no duplicate installations exist

---

## Updating

### Via HACS

1. HACS will notify you of updates
2. Click **Update** in HACS
3. Restart Home Assistant

### Manual Update

1. Download latest release
2. Replace existing files in `custom_components/nidia_magic_composer/`
3. Restart Home Assistant

---

## Uninstallation

1. Remove integration from **Settings** → **Devices & Services**
2. Delete `/config/custom_components/nidia_magic_composer/`
3. Restart Home Assistant
4. Remove **Magic Composer** from sidebar (if still visible)

---

## Next Steps

Once installed, proceed to the [Usage Guide](README.md#usage) to learn how to use the wizard.

For development, see [DEVELOPMENT.md](DEVELOPMENT.md).
