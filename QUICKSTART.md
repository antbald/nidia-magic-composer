# Quick Start Guide

## 🚀 Phase 1 Complete - Integration Skeleton Ready

The **Nidia Magic Composer** integration skeleton is now complete and ready for deployment!

## What's Built

### ✅ Backend (Python)
- **Integration Core** ([__init__.py](custom_components/nidia_magic_composer/__init__.py))
  - Async setup/unload
  - Custom panel registration
  - Domain data management

- **Config Flow** ([config_flow.py](custom_components/nidia_magic_composer/config_flow.py))
  - User setup wizard
  - Options flow for configuration updates
  - Single-instance enforcement

- **WebSocket API** ([websocket.py](custom_components/nidia_magic_composer/websocket.py))
  - `areas/list` - List all areas
  - `areas/create` - Create new area
  - `areas/update` - Update existing area
  - `areas/delete` - Delete area
  - `wizard/preview` - Preview changeset (stub)
  - `wizard/apply` - Apply changeset (stub)
  - `wizard/status` - Get wizard status (stub)

- **Constants & Services** ([const.py](custom_components/nidia_magic_composer/const.py), [services.yaml](custom_components/nidia_magic_composer/services.yaml))
  - Domain constants
  - Service definitions (stubs)
  - Configuration keys

### ✅ Frontend (React + TypeScript)
- **App Shell** ([frontend/src/App.tsx](frontend/src/App.tsx))
  - React Router navigation
  - Six-step wizard layout
  - Responsive design

- **Views** (all in [frontend/src/views/](frontend/src/views/))
  - Profile - Home profile configuration
  - Rooms - Area management
  - Map - Floor plan visualization
  - Helpers - Entity generation
  - Dashboards - Template builder
  - Review - Preview and apply

- **Build System** ([frontend/vite.config.ts](frontend/vite.config.ts))
  - Vite bundler
  - TypeScript compilation
  - Output to `custom_components/nidia_magic_composer/panel/`

### ✅ HACS Compatibility
- [hacs.json](hacs.json) - HACS metadata
- [manifest.json](custom_components/nidia_magic_composer/manifest.json) - Integration manifest
- [README.md](README.md) - Documentation
- [LICENSE](LICENSE) - MIT License
- [CHANGELOG.md](CHANGELOG.md) - Version history

### ✅ CI/CD
- [.github/workflows/release.yml](.github/workflows/release.yml) - Release automation
- [.github/workflows/validate.yml](.github/workflows/validate.yml) - PR validation

## 📦 Installation Test

### 1. Build Frontend
```bash
cd frontend
npm install
npm run build
```

### 2. Validate Structure
```bash
./scripts/validate.sh
```

Expected output:
```
✅ All validations passed!
📦 Integration is ready for installation
```

### 3. Install in Home Assistant

#### Option A: Symlink for Development
```bash
ln -s $(pwd)/custom_components/nidia_magic_composer \
  /path/to/homeassistant/config/custom_components/nidia_magic_composer
```

#### Option B: Copy for Testing
```bash
cp -r custom_components/nidia_magic_composer \
  /path/to/homeassistant/config/custom_components/
```

### 4. Restart Home Assistant

### 5. Add Integration
1. Go to **Settings** → **Devices & Services**
2. Click **+ Add Integration**
3. Search for "Nidia Magic Composer"
4. Complete config flow
5. Find **Magic Composer** in sidebar

## 🧪 Testing the Skeleton

### Backend Tests

1. **Check Integration Loads**
   - Look in **Settings** → **Devices & Services**
   - Should see "Nidia Magic Composer" configured

2. **Test WebSocket API**
   - Open browser DevTools
   - Go to Magic Composer panel
   - Check Network tab for WebSocket connection
   - Look for `nidia_magic_composer/*` messages

3. **Verify Services**
   - Go to **Developer Tools** → **Services**
   - Search for "nidia_magic_composer"
   - Should see wizard_preview, wizard_apply, create_area

### Frontend Tests

1. **Panel Loads**
   - Click **Magic Composer** in sidebar
   - Should see wizard interface
   - Navigation tabs should work

2. **View Navigation**
   - Click each tab: Profile, Rooms, Map, Helpers, Dashboards, Review
   - Each should display placeholder content
   - No console errors

3. **Responsive Design**
   - Resize browser window
   - Check mobile view
   - Verify layout adapts

## 📝 Next Steps

### Immediate (Phase 2)
1. Implement Profile view logic
2. Build Room management interface
3. Connect WebSocket API to frontend
4. Add real-time state updates

### Short-term (Phase 3)
1. Floor plan editor (Map view)
2. Helper entity generation
3. Dashboard template system
4. Preview/apply logic with changesets

### Long-term (Phase 4)
1. Idempotent changeset engine
2. Rollback functionality
3. Version tracking
4. Export/import configurations

## 📚 Documentation

- [README.md](README.md) - Overview and features
- [INSTALLATION.md](INSTALLATION.md) - Installation instructions
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development guide
- [CHANGELOG.md](CHANGELOG.md) - Version history

## 🐛 Known Limitations (Expected)

- All views show placeholder content (by design)
- WebSocket handlers return stub data (by design)
- No actual changeset logic yet (planned for Phase 2)
- Panel iframe may show initially (HA behavior)
- No business logic implemented (skeleton only)

## ✅ Verification Checklist

- [x] Backend integration loads without errors
- [x] Config flow completes successfully
- [x] Panel appears in sidebar
- [x] Frontend builds and serves correctly
- [x] WebSocket API registers handlers
- [x] Services appear in developer tools
- [x] All views navigate correctly
- [x] HACS metadata is valid
- [x] README and documentation complete
- [x] Validation script passes

## 🚢 Publishing to GitHub

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial integration skeleton v0.1.1"

# Add remote and push
git remote add origin https://github.com/antbald/nidia-magic-composer.git
git branch -M main
git push -u origin main

# Create release tag
git tag v0.1.1
git push origin v0.1.1
```

Then create a GitHub Release:
1. Go to repository → Releases → New Release
2. Tag: `v0.1.1`
3. Title: `v0.1.1 - Initial Skeleton`
4. Description: Copy from CHANGELOG.md
5. Publish

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/antbald/nidia-magic-composer/issues)
- **Development**: See [DEVELOPMENT.md](DEVELOPMENT.md)

---

**Status**: ✅ Phase 1 Complete - Ready for Development
**Version**: 0.1.1
**Last Updated**: 2024-10-29
