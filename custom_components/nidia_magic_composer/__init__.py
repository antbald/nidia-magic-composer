"""The Nidia Magic Composer integration."""
from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from .const import DOMAIN, PANEL_NAME, PANEL_TITLE, PANEL_ICON
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
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = {
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
                    "js_url": f"/local/nidia_magic_composer/index.js",
                }
            },
            require_admin=True,
        )
        _LOGGER.info("Custom panel registered successfully")
    except Exception as err:
        _LOGGER.error("Failed to register custom panel: %s", err)
        raise
