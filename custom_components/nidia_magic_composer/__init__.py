"""The Nidia Magic Composer integration."""
from __future__ import annotations

import logging
from pathlib import Path
from typing import TYPE_CHECKING, Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.components.http import StaticPathConfig
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType
from homeassistant.exceptions import HomeAssistantError

from .const import DOMAIN, PANEL_NAME, PANEL_TITLE, PANEL_ICON, VERSION
from .websocket_api import async_register_area_commands

if TYPE_CHECKING:
    from homeassistant.components.frontend import Panel

_LOGGER = logging.getLogger(__name__)

# TODO: Add platforms if needed (e.g., sensor, switch)
PLATFORMS: list[Platform] = []

# Integration schema (empty for now, config flow only)
CONFIG_SCHEMA = cv.empty_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the Nidia Magic Composer integration from YAML (not used)."""
    # Config flow only - no YAML configuration supported
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Nidia Magic Composer from a config entry."""
    _LOGGER.info("Setting up Nidia Magic Composer integration")

    # Initialize domain data storage
    domain_data: dict[str, Any] = hass.data.setdefault(DOMAIN, {})
    domain_data[entry.entry_id] = {
        "config": entry.data,
        "options": entry.options,
    }

    # Register WebSocket API handlers
    async_register_area_commands(hass)

    # Register custom panel
    await _async_register_panel(hass)

    # TODO: Register services for wizard operations
    # TODO: Set up platforms if needed

    # Forward setup to platforms (if any)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    _LOGGER.info("Nidia Magic Composer integration setup complete")
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    _LOGGER.info("Unloading Nidia Magic Composer integration")

    # Unload platforms
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)

    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok


async def _async_register_panel(hass: HomeAssistant) -> None:
    """Register the custom panel for the integration."""
    try:
        # Register the panel using the frontend component
        from homeassistant.components.frontend import (
            async_register_built_in_panel,
            async_remove_panel,
        )

        # Remove any previously registered panel with the same name to prevent duplicates.
        async_remove_panel(hass, PANEL_NAME, warn_if_unknown=False)

        panel_assets = Path(__file__).parent / "panel"
        if not panel_assets.exists():
            raise HomeAssistantError(
                f"Panel assets are missing from {panel_assets}. "
                "Reinstall the integration or rebuild the frontend (npm run build)."
            )

        domain_data: dict[str, Any] = hass.data.setdefault(DOMAIN, {})
        static_paths: set[str] = domain_data.setdefault("static_paths", set())
        static_url_path = f"/{PANEL_NAME}-{VERSION}"

        if static_url_path not in static_paths:
            try:
                await hass.http.async_register_static_paths(
                    [
                        StaticPathConfig(
                            url_path=static_url_path,
                            path=str(panel_assets),
                        )
                    ]
                )
            except OSError as err:
                raise HomeAssistantError(
                    f"Failed to expose panel assets at {static_url_path}: {err}"
                ) from err

            static_paths.add(static_url_path)

        async_register_built_in_panel(
            hass,
            component_name="custom",
            sidebar_title=PANEL_TITLE,
            sidebar_icon=PANEL_ICON,
            frontend_url_path=PANEL_NAME,
            config={
                "_panel_custom": {
                    "name": PANEL_NAME,
                    "embed_iframe": True,
                    "trust_external": False,
                    "module_url": f"{static_url_path}/index.js?v={VERSION}",
                    "js_url": f"{static_url_path}/index.js?v={VERSION}",
                }
            },
            require_admin=True,
        )
        _LOGGER.info("Custom panel registered successfully")
    except Exception as err:
        _LOGGER.error("Failed to register custom panel: %s", err)
        raise
