"""WebSocket API handlers for Nidia Magic Composer."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import area_registry as ar

from .const import (
    WS_TYPE_AREAS_LIST,
    WS_TYPE_AREAS_CREATE,
    WS_TYPE_AREAS_UPDATE,
    WS_TYPE_AREAS_DELETE,
    WS_TYPE_WIZARD_PREVIEW,
    WS_TYPE_WIZARD_APPLY,
    WS_TYPE_WIZARD_STATUS,
)

_LOGGER = logging.getLogger(__name__)


@callback
def async_register_websocket_handlers(hass: HomeAssistant) -> None:
    """Register WebSocket API handlers."""
    websocket_api.async_register_command(hass, websocket_areas_list)
    websocket_api.async_register_command(hass, websocket_areas_create)
    websocket_api.async_register_command(hass, websocket_areas_update)
    websocket_api.async_register_command(hass, websocket_areas_delete)
    websocket_api.async_register_command(hass, websocket_wizard_preview)
    websocket_api.async_register_command(hass, websocket_wizard_apply)
    websocket_api.async_register_command(hass, websocket_wizard_status)
    _LOGGER.info("WebSocket handlers registered")


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_AREAS_LIST,
    }
)
@websocket_api.async_response
async def websocket_areas_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """List all areas in Home Assistant."""
    # TODO: Add filtering/sorting options
    area_registry = ar.async_get(hass)
    areas = [
        {
            "id": area.id,
            "name": area.name,
            "picture": area.picture,
            "aliases": list(area.aliases),
        }
        for area in area_registry.areas.values()
    ]

    connection.send_result(msg["id"], {"areas": areas})


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_AREAS_CREATE,
        vol.Required("name"): str,
        vol.Optional("picture"): vol.Any(str, None),
        vol.Optional("aliases"): [str],
    }
)
@websocket_api.async_response
async def websocket_areas_create(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Create a new area."""
    # TODO: Implement idempotent changeset tracking
    area_registry = ar.async_get(hass)

    try:
        area = area_registry.async_create(
            name=msg["name"],
            picture=msg.get("picture"),
            aliases=set(msg.get("aliases", [])),
        )

        connection.send_result(
            msg["id"],
            {
                "area": {
                    "id": area.id,
                    "name": area.name,
                    "picture": area.picture,
                    "aliases": list(area.aliases),
                }
            },
        )
    except Exception as err:
        _LOGGER.error("Failed to create area: %s", err)
        connection.send_error(msg["id"], "create_failed", str(err))


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_AREAS_UPDATE,
        vol.Required("area_id"): str,
        vol.Optional("name"): str,
        vol.Optional("picture"): vol.Any(str, None),
        vol.Optional("aliases"): [str],
    }
)
@websocket_api.async_response
async def websocket_areas_update(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update an existing area."""
    # TODO: Implement idempotent changeset tracking
    area_registry = ar.async_get(hass)

    try:
        updates = {}
        if "name" in msg:
            updates["name"] = msg["name"]
        if "picture" in msg:
            updates["picture"] = msg["picture"]
        if "aliases" in msg:
            updates["aliases"] = set(msg["aliases"])

        area = area_registry.async_update(msg["area_id"], **updates)

        connection.send_result(
            msg["id"],
            {
                "area": {
                    "id": area.id,
                    "name": area.name,
                    "picture": area.picture,
                    "aliases": list(area.aliases),
                }
            },
        )
    except Exception as err:
        _LOGGER.error("Failed to update area: %s", err)
        connection.send_error(msg["id"], "update_failed", str(err))


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_AREAS_DELETE,
        vol.Required("area_id"): str,
    }
)
@websocket_api.async_response
async def websocket_areas_delete(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Delete an area."""
    # TODO: Implement idempotent changeset tracking
    # TODO: Add safety checks (prevent deletion if devices/entities assigned)
    area_registry = ar.async_get(hass)

    try:
        area_registry.async_delete(msg["area_id"])
        connection.send_result(msg["id"], {"success": True})
    except Exception as err:
        _LOGGER.error("Failed to delete area: %s", err)
        connection.send_error(msg["id"], "delete_failed", str(err))


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_WIZARD_PREVIEW,
        vol.Required("profile"): dict,
    }
)
@websocket_api.async_response
async def websocket_wizard_preview(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Preview wizard changes without applying them."""
    # TODO: Implement changeset generation logic
    # This will generate a diff of what will be created/modified

    preview_data = {
        "areas_to_create": [],
        "helpers_to_create": [],
        "dashboards_to_create": [],
        "entities_to_assign": [],
    }

    connection.send_result(msg["id"], {"preview": preview_data})


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_WIZARD_APPLY,
        vol.Required("changeset_id"): str,
    }
)
@websocket_api.async_response
async def websocket_wizard_apply(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Apply wizard changes from a preview changeset."""
    # TODO: Implement changeset application logic
    # This will execute the changes in an idempotent way

    result = {
        "success": True,
        "changeset_id": msg["changeset_id"],
        "applied_at": None,  # TODO: Add timestamp
        "rollback_id": None,  # TODO: Generate rollback changeset
    }

    connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_WIZARD_STATUS,
    }
)
@websocket_api.async_response
async def websocket_wizard_status(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Get current wizard status and history."""
    # TODO: Implement status tracking
    # This will return current wizard state, pending changes, history

    status = {
        "is_running": False,
        "current_step": None,
        "pending_changesets": [],
        "applied_changesets": [],
    }

    connection.send_result(msg["id"], status)
