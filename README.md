# Nidia Magic Composer

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub Release](https://img.shields.io/github/release/antoniobaldassarre/nidia-magic-composer.svg)](https://github.com/antoniobaldassarre/nidia-magic-composer/releases)
[![License](https://img.shields.io/github/license/antoniobaldassarre/nidia-magic-composer.svg)](LICENSE)

Automated Home Assistant setup wizard for the Nidia ecosystem. Simplifies initial deployment through a guided UI that creates areas, helpers, and dashboards automatically.

## Features

- **Profile-based setup**: Configure your home with predefined profiles.
- **Room management**: Automatically create and organize areas.
- **Visual floor planning**: Interactive floor plan editor (coming soon).
- **Helper generation**: Auto-generate input helpers for workflows.
- **Dashboard templates**: Build Lovelace dashboards from templates.
- **Idempotent changes**: Preview, apply, and roll back configurations safely.
- **Version tracking**: Track all wizard changes with full history.

## Installation

### HACS (Recommended)

1. Open HACS in your Home Assistant instance.
2. Go to `Integrations`.
3. Click the three dots in the top right and select `Custom repositories`.
4. Add this repository URL: `https://github.com/antoniobaldassarre/nidia-magic-composer`.
5. Select category `Integration`.
6. Click `Add`.
7. Find `Nidia Magic Composer` in the list and click `Download`.
8. Restart Home Assistant.

### Manual Installation

1. Download the latest release from [GitHub Releases](https://github.com/antoniobaldassarre/nidia-magic-composer/releases).
2. Extract the `custom_components/nidia_magic_composer` folder.
3. Copy it to your `custom_components` directory in Home Assistant.
4. Restart Home Assistant.

## Configuration

1. Go to **Settings** → **Devices & Services**.
2. Click **+ Add Integration**.
3. Search for `Nidia Magic Composer`.
4. Follow the configuration flow.
5. Access the wizard from the sidebar: **Magic Composer**.

## Usage

The wizard guides you through six steps:

1. **Profile**: Select or create a home profile.
2. **Rooms**: Define areas and assign devices.
3. **Map**: Visualize room layout (optional).
4. **Helpers**: Generate standardized helper entities.
5. **Dashboards**: Build dashboards from templates.
6. **Review**: Preview and apply all changes.

All changes are idempotent and can be rolled back if needed.

## Development

This integration is built as a Home Assistant custom component with:

- **Backend**: Python integration with WebSocket API.
- **Frontend**: TypeScript + React + Vite.
- **Distribution**: HACS-compatible with semantic versioning.

### Building Frontend

```bash
cd frontend
npm install
npm run build
```

Output is generated in `custom_components/nidia_magic_composer/panel/`.

### Project Structure

```
nidia-magic-composer/
├── custom_components/
│   └── nidia_magic_composer/
│       ├── __init__.py
│       ├── config_flow.py
│       ├── const.py
│       ├── manifest.json
│       ├── services.yaml
│       ├── websocket.py
│       └── panel/           # Built frontend assets
├── frontend/
│   ├── src/
│   │   ├── views/           # Wizard steps
│   │   ├── components/
│   │   ├── hooks/
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
├── hacs.json
└── README.md
```

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

## License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/antoniobaldassarre/nidia-magic-composer/issues)
- **Documentation**: Wiki (coming soon)

## Roadmap

- [x] Basic integration skeleton
- [x] WebSocket API for area management
- [x] Frontend app shell with routing
- [ ] Profile configuration implementation
- [ ] Room management with device assignment
- [ ] Interactive floor plan editor
- [ ] Helper entity generation
- [ ] Dashboard template system
- [ ] Changeset preview and apply logic
- [ ] Rollback functionality
- [ ] Version tracking and history

---

**Part of the Nidia Ecosystem** | Built for Home Assistant
