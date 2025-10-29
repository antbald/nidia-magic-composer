"""WebSocket API for room (area) management."""
from __future__ import annotations

import logging
from typing import Any, Iterable

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers.area_registry import AreaEntry

from .const import (
    WS_TYPE_AREAS_CREATE,
    WS_TYPE_AREAS_DELETE,
    WS_TYPE_AREAS_LIST,
    WS_TYPE_AREAS_UPDATE,
)

_LOGGER = logging.getLogger(__name__)


@callback
def async_register_area_commands(hass: HomeAssistant) -> None:
    """Register the area management WebSocket commands."""
    websocket_api.async_register_command(hass, websocket_areas_list)
    websocket_api.async_register_command(hass, websocket_areas_create)
    websocket_api.async_register_command(hass, websocket_areas_update)
    websocket_api.async_register_command(hass, websocket_areas_delete)
    _LOGGER.debug("Registered area management WebSocket commands")


def _normalize_name(raw_name: str) -> str:
    """Trim and normalise a room name."""
    return raw_name.strip()


def _name_exists(
    areas: Iterable[AreaEntry], candidate: str, *, skip_area_id: str | None = None
) -> bool:
    """Check whether a name already exists (case-insensitive)."""
    candidate_key = candidate.casefold()
    for area in areas:
        if skip_area_id and area.id == skip_area_id:
            continue
        if area.name and area.name.casefold() == candidate_key:
            return True
    return False


def _serialize_area(area: ar.AreaEntry) -> dict[str, Any]:
    """Serialize an area entry for the frontend."""
    return {
        "id": area.id,
        "name": area.name,
    }


@websocket_api.websocket_command({vol.Required("type"): WS_TYPE_AREAS_LIST})
@websocket_api.async_response
async def websocket_areas_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return all areas in Home Assistant."""
    area_registry = ar.async_get(hass)
    areas = [_serialize_area(area) for area in area_registry.areas.values()]
    connection.send_result(msg["id"], {"areas": areas})


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_AREAS_CREATE,
        vol.Required("name"): str,
    }
)
@websocket_api.async_response
async def websocket_areas_create(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Create a new area entry."""
    area_registry = ar.async_get(hass)

    normalized_name = _normalize_name(msg["name"])
    if not normalized_name:
        connection.send_error(msg["id"], "invalid_name", "Room name cannot be empty")
        return

    if _name_exists(area_registry.areas.values(), normalized_name):
        connection.send_error(
            msg["id"],
            "duplicate_name",
            f"A room named '{normalized_name}' already exists",
        )
        return

    try:
        area = area_registry.async_create(name=normalized_name)
    except Exception as err:  # pragma: no cover - defensive logging
        _LOGGER.error("Failed to create area: %s", err, exc_info=err)
        connection.send_error(msg["id"], "create_failed", str(err))
        return

    connection.send_result(msg["id"], {"area": _serialize_area(area)})


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_AREAS_UPDATE,
        vol.Required("area_id"): str,
        vol.Required("name"): str,
    }
)
@websocket_api.async_response
async def websocket_areas_update(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Rename an existing area."""
    area_registry = ar.async_get(hass)
    area_id = msg["area_id"]
    existing_area = area_registry.async_get_area(area_id)

    if existing_area is None:
        connection.send_error(msg["id"], "not_found", f"Area '{area_id}' not found")
        return

    normalized_name = _normalize_name(msg["name"])
    if not normalized_name:
        connection.send_error(msg["id"], "invalid_name", "Room name cannot be empty")
        return

    if _name_exists(
        area_registry.areas.values(), normalized_name, skip_area_id=area_id
    ):
        connection.send_error(
            msg["id"],
            "duplicate_name",
            f"A room named '{normalized_name}' already exists",
        )
        return

    if existing_area.name == normalized_name:
        connection.send_result(msg["id"], {"area": _serialize_area(existing_area)})
        return

    try:
        updated_area = area_registry.async_update(area_id, name=normalized_name)
    except Exception as err:  # pragma: no cover - defensive logging
        _LOGGER.error("Failed to update area '%s': %s", area_id, err)
        connection.send_error(msg["id"], "update_failed", str(err))
        return

    connection.send_result(msg["id"], {"area": _serialize_area(updated_area)})


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
    area_registry = ar.async_get(hass)
    area_id = msg["area_id"]

    if area_registry.async_get_area(area_id) is None:
        connection.send_error(msg["id"], "not_found", f"Area '{area_id}' not found")
        return

    try:
        area_registry.async_delete(area_id)
    except Exception as err:  # pragma: no cover - defensive logging
        _LOGGER.error("Failed to delete area '%s': %s", area_id, err)
        connection.send_error(msg["id"], "delete_failed", str(err))
        return

    connection.send_result(msg["id"], {"success": True, "area_id": area_id})
