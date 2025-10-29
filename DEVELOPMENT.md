# Development Guide

## Project Structure

```
nidia-magic-composer/
├── .github/
│   └── workflows/           # CI/CD workflows
│       ├── release.yml      # Release automation
│       └── validate.yml     # PR validation
├── custom_components/
│   └── nidia_magic_composer/
│       ├── __init__.py      # Integration entry point
│       ├── config_flow.py   # Configuration UI
│       ├── const.py         # Constants
│       ├── manifest.json    # Integration metadata
│       ├── services.yaml    # Service definitions
│       ├── strings.json     # Localization strings
│       ├── websocket.py     # WebSocket API handlers
│       └── panel/           # Built frontend (generated)
├── frontend/
│   ├── src/
│   │   ├── views/           # Wizard step views
│   │   ├── components/      # Reusable components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── scripts/
│   └── validate.sh          # Validation script
├── hacs.json                # HACS metadata
├── README.md
├── CHANGELOG.md
└── LICENSE
```

## Setup Development Environment

### Prerequisites

- Python 3.11+
- Node.js 18+
- Home Assistant development instance
- Git

### Clone Repository

```bash
git clone https://github.com/antbald/nidia-magic-composer.git
cd nidia-magic-composer
```

### Backend Setup

1. Create a symbolic link to your Home Assistant config:

```bash
ln -s $(pwd)/custom_components/nidia_magic_composer \
  /path/to/homeassistant/config/custom_components/nidia_magic_composer
```

2. Install Home Assistant for type checking:

```bash
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install homeassistant
```

### Frontend Setup

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Run development server:

```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Building for Production

Build the frontend assets:

```bash
cd frontend
npm run build
```

This outputs to `custom_components/nidia_magic_composer/panel/`

## Development Workflow

### 1. Backend Development

#### Adding WebSocket Commands

Edit [websocket.py](custom_components/nidia_magic_composer/websocket.py):

```python
@websocket_api.websocket_command(
    {
        vol.Required("type"): "nidia_magic_composer/custom/command",
        vol.Required("param"): str,
    }
)
@websocket_api.async_response
async def websocket_custom_command(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Handle custom command."""
    # Implementation here
    connection.send_result(msg["id"], {"result": "success"})
```

Register in `async_register_websocket_handlers()`:

```python
websocket_api.async_register_command(hass, websocket_custom_command)
```

#### Adding Services

1. Define in [services.yaml](custom_components/nidia_magic_composer/services.yaml)
2. Implement in `__init__.py`:

```python
async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    # ...

    async def handle_custom_service(call):
        """Handle custom service call."""
        # Implementation
        pass

    hass.services.async_register(DOMAIN, "custom_service", handle_custom_service)
```

### 2. Frontend Development

#### Adding New Views

Create in `frontend/src/views/`:

```tsx
import React from 'react'

const NewView: React.FC = () => {
  return (
    <div className="view-container">
      <h2>New View</h2>
      {/* Content */}
    </div>
  )
}

export default NewView
```

Add route in `App.tsx`:

```tsx
<Route path="/new-view" element={<NewView />} />
```

#### Using WebSocket API

Create a hook in `frontend/src/hooks/`:

```tsx
import { useEffect, useState } from 'react'

export const useAreas = () => {
  const [areas, setAreas] = useState([])

  useEffect(() => {
    const fetchAreas = async () => {
      // @ts-ignore - Home Assistant WebSocket API
      const result = await window.hassConnection.sendMessagePromise({
        type: 'nidia_magic_composer/areas/list'
      })
      setAreas(result.areas)
    }

    fetchAreas()
  }, [])

  return areas
}
```

### 3. Testing

#### Validate Structure

```bash
./scripts/validate.sh
```

#### Type Check Frontend

```bash
cd frontend
npm run type-check
```

#### Lint Frontend

```bash
cd frontend
npm run lint
```

#### Check Python Syntax

```bash
python -m py_compile custom_components/nidia_magic_composer/*.py
```

### 4. Debugging

#### Backend Logs

Watch Home Assistant logs:

```bash
tail -f /config/home-assistant.log | grep nidia_magic_composer
```

Or use Home Assistant UI: **Settings** → **System** → **Logs**

#### Frontend Debugging

1. Open browser DevTools
2. Check Console for errors
3. Use Network tab to inspect WebSocket messages
4. React DevTools for component inspection

## Release Process

### 1. Update Version

Update version in:
- `custom_components/nidia_magic_composer/manifest.json`
- `custom_components/nidia_magic_composer/const.py`
- `frontend/package.json`

### 2. Update Changelog

Add entry to [CHANGELOG.md](CHANGELOG.md):

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New feature

### Changed
- Modified behavior

### Fixed
- Bug fix
```

### 3. Commit and Tag

```bash
git add .
git commit -m "Release vX.Y.Z"
git tag vX.Y.Z
git push origin main
git push origin vX.Y.Z
```

### 4. Create GitHub Release

1. Go to GitHub repository
2. Click **Releases** → **Create a new release**
3. Select tag `vX.Y.Z`
4. Add release notes from CHANGELOG
5. Publish release

GitHub Actions will automatically:
- Build frontend
- Create release archive
- Upload assets

## Code Style

### Python

- Follow [PEP 8](https://pep8.org/)
- Use type hints
- Add docstrings to functions
- Use async/await patterns

### TypeScript/React

- Use functional components with hooks
- Follow React best practices
- Use TypeScript strict mode
- Keep components small and focused

## Architecture Notes

### Panel Registration

The integration uses Home Assistant's custom panel system. The panel is registered in `__init__.py` and serves the built React app from the `panel/` directory.

### WebSocket Communication

Frontend communicates with backend via Home Assistant's WebSocket API. All commands are prefixed with `nidia_magic_composer/`.

### State Management

Currently using React hooks for local state. Consider adding a state management library (Redux, Zustand) as complexity grows.

### Idempotent Changes

Future implementation should:
1. Generate changeset with UUID
2. Preview changes before applying
3. Store changeset history
4. Support rollback operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## Resources

- [Home Assistant Developer Docs](https://developers.home-assistant.io/)
- [HACS Developer Docs](https://hacs.xyz/docs/publish/start)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
