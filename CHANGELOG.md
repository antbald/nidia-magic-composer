# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### TODO
- Profile configuration implementation
- Room management with device assignment
- Interactive floor plan editor
- Helper entity generation logic
- Dashboard template system
- Changeset preview and apply functionality
- Rollback capability
- Version tracking and history

## [0.1.8] - 2024-10-30

### Fixed
- Bundle panel assets with the integration and fail fast when they are missing.

## [0.1.7] - 2024-10-30

### Fixed
- Serve panel assets through Home Assistant's static path and update the panel script URL.

## [0.1.6] - 2024-10-30

### Fixed
- Treat panel helpers as synchronous to prevent coroutine type errors during setup.

## [0.1.5] - 2024-10-30

### Fixed
- Removed an unnecessary await when cleaning up the custom panel registration.

## [0.1.4] - 2024-10-30

### Fixed
- Pass `hass` into the frontend helper when registering the custom panel.
- Silence the upcoming options-flow deprecation by avoiding `config_entry` shadowing.

## [0.1.3] - 2024-10-30

### Fixed
- Use the supported frontend helper to register the custom panel.

## [0.1.2] - 2024-10-30

### Fixed
- Removed unsupported schema descriptions so the config flow registers correctly.
- Updated manifest metadata and rebuilt the frontend bundle.

## [0.1.1] - 2024-10-30

### Fixed
- Added base translation bundle so Home Assistant lists the integration.
- Normalised repository links and version numbers across manifest, docs, and frontend.

## [0.1.0] - 2024-10-29

### Added
- Initial release with basic skeleton
- Integration setup and config flow
- Custom panel registration
- WebSocket API stubs
- Frontend build system (Vite + React + TypeScript)
- Placeholder views for wizard steps
- HACS integration support

[Unreleased]: https://github.com/antbald/nidia-magic-composer/compare/v0.1.8...HEAD
[0.1.8]: https://github.com/antbald/nidia-magic-composer/releases/tag/v0.1.8
[0.1.7]: https://github.com/antbald/nidia-magic-composer/releases/tag/v0.1.7
[0.1.6]: https://github.com/antbald/nidia-magic-composer/releases/tag/v0.1.6
[0.1.5]: https://github.com/antbald/nidia-magic-composer/releases/tag/v0.1.5
[0.1.4]: https://github.com/antbald/nidia-magic-composer/releases/tag/v0.1.4
[0.1.3]: https://github.com/antbald/nidia-magic-composer/releases/tag/v0.1.3
[0.1.2]: https://github.com/antbald/nidia-magic-composer/releases/tag/v0.1.2
[0.1.1]: https://github.com/antbald/nidia-magic-composer/releases/tag/v0.1.1
[0.1.0]: https://github.com/antbald/nidia-magic-composer/releases/tag/v0.1.0
