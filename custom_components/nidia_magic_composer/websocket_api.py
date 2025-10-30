"""WebSocket API for room (area) management."""
from __future__ import annotations

import logging
from typing import Any, Iterable

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import area_registry as ar, floor_registry as fr
from homeassistant.helpers.area_registry import AreaEntry
from homeassistant.helpers.floor_registry import FloorEntry

from .const import (
    WS_TYPE_AREAS_CREATE,
    WS_TYPE_AREAS_DELETE,
    WS_TYPE_AREAS_LIST,
    WS_TYPE_AREAS_UPDATE,
    WS_TYPE_FLOORS_CREATE,
    WS_TYPE_FLOORS_DELETE,
    WS_TYPE_FLOORS_LIST,
    WS_TYPE_FLOORS_UPDATE,
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


@callback
def async_register_floor_commands(hass: HomeAssistant) -> None:
    """Register the floor management WebSocket commands."""
    websocket_api.async_register_command(hass, websocket_floors_list)
    websocket_api.async_register_command(hass, websocket_floors_create)
    websocket_api.async_register_command(hass, websocket_floors_update)
    websocket_api.async_register_command(hass, websocket_floors_delete)
    _LOGGER.debug("Registered floor management WebSocket commands")


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
        "icon": area.icon,
        "floor_id": area.floor_id,
        "labels": list(area.labels) if area.labels else [],
        "aliases": list(area.aliases) if area.aliases else [],
    }


def _serialize_floor(floor: fr.FloorEntry) -> dict[str, Any]:
    """Serialize a floor entry for the frontend."""
    return {
        "floor_id": floor.floor_id,
        "name": floor.name,
        "icon": floor.icon,
        "level": floor.level,
        "aliases": list(floor.aliases) if floor.aliases else [],
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
        vol.Optional("icon"): vol.Any(str, None),
        vol.Optional("floor_id"): vol.Any(str, None),
        vol.Optional("labels"): [str],
        vol.Optional("aliases"): [str],
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
        connection.send_error(msg["id"], "invalid_name", "Area name cannot be empty")
        return

    if _name_exists(area_registry.areas.values(), normalized_name):
        connection.send_error(
            msg["id"],
            "duplicate_name",
            f"An area named '{normalized_name}' already exists",
        )
        return

    # Validate floor exists if provided
    if msg.get("floor_id"):
        floor_registry = fr.async_get(hass)
        if not floor_registry.async_get_floor(msg["floor_id"]):
            connection.send_error(
                msg["id"], "invalid_floor", f"Floor '{msg['floor_id']}' not found"
            )
            return

    try:
        area = area_registry.async_create(
            name=normalized_name,
            icon=msg.get("icon"),
            floor_id=msg.get("floor_id"),
            labels=set(msg.get("labels", [])),
            aliases=set(msg.get("aliases", [])),
        )
    except Exception as err:  # pragma: no cover - defensive logging
        _LOGGER.error("Failed to create area: %s", err, exc_info=err)
        connection.send_error(msg["id"], "create_failed", str(err))
        return

    connection.send_result(msg["id"], {"area": _serialize_area(area)})


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_AREAS_UPDATE,
        vol.Required("area_id"): str,
        vol.Optional("name"): str,
        vol.Optional("icon"): vol.Any(str, None),
        vol.Optional("floor_id"): vol.Any(str, None),
        vol.Optional("labels"): [str],
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
    area_registry = ar.async_get(hass)
    area_id = msg["area_id"]
    existing_area = area_registry.async_get_area(area_id)

    if existing_area is None:
        connection.send_error(msg["id"], "not_found", f"Area '{area_id}' not found")
        return

    # Prepare update parameters
    updates = {}

    # Handle name update
    if "name" in msg:
        normalized_name = _normalize_name(msg["name"])
        if not normalized_name:
            connection.send_error(msg["id"], "invalid_name", "Area name cannot be empty")
            return

        if _name_exists(
            area_registry.areas.values(), normalized_name, skip_area_id=area_id
        ):
            connection.send_error(
                msg["id"],
                "duplicate_name",
                f"An area named '{normalized_name}' already exists",
            )
            return
        updates["name"] = normalized_name

    # Handle icon update
    if "icon" in msg:
        updates["icon"] = msg["icon"]

    # Handle floor_id update
    if "floor_id" in msg:
        if msg["floor_id"]:
            floor_registry = fr.async_get(hass)
            if not floor_registry.async_get_floor(msg["floor_id"]):
                connection.send_error(
                    msg["id"], "invalid_floor", f"Floor '{msg['floor_id']}' not found"
                )
                return
        updates["floor_id"] = msg["floor_id"]

    # Handle labels update
    if "labels" in msg:
        updates["labels"] = set(msg["labels"])

    # Handle aliases update
    if "aliases" in msg:
        updates["aliases"] = set(msg["aliases"])

    try:
        updated_area = area_registry.async_update(area_id, **updates)
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


# ======================== FLOOR MANAGEMENT ========================


@websocket_api.websocket_command({vol.Required("type"): WS_TYPE_FLOORS_LIST})
@websocket_api.async_response
async def websocket_floors_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return all floors in Home Assistant."""
    floor_registry = fr.async_get(hass)
    floors = [_serialize_floor(floor) for floor in floor_registry.floors.values()]
    connection.send_result(msg["id"], {"floors": floors})


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_FLOORS_CREATE,
        vol.Required("name"): str,
        vol.Optional("icon"): vol.Any(str, None),
        vol.Optional("level"): vol.Any(int, None),
        vol.Optional("aliases"): [str],
    }
)
@websocket_api.async_response
async def websocket_floors_create(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Create a new floor entry."""
    floor_registry = fr.async_get(hass)

    normalized_name = _normalize_name(msg["name"])
    if not normalized_name:
        connection.send_error(msg["id"], "invalid_name", "Floor name cannot be empty")
        return

    # Check for duplicate name
    for floor in floor_registry.floors.values():
        if floor.name.casefold() == normalized_name.casefold():
            connection.send_error(
                msg["id"],
                "duplicate_name",
                f"A floor named '{normalized_name}' already exists",
            )
            return

    try:
        floor = floor_registry.async_create(
            name=normalized_name,
            icon=msg.get("icon"),
            level=msg.get("level"),
            aliases=set(msg.get("aliases", [])),
        )
    except Exception as err:  # pragma: no cover - defensive logging
        _LOGGER.error("Failed to create floor: %s", err, exc_info=err)
        connection.send_error(msg["id"], "create_failed", str(err))
        return

    connection.send_result(msg["id"], {"floor": _serialize_floor(floor)})


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_FLOORS_UPDATE,
        vol.Required("floor_id"): str,
        vol.Optional("name"): str,
        vol.Optional("icon"): vol.Any(str, None),
        vol.Optional("level"): vol.Any(int, None),
        vol.Optional("aliases"): [str],
    }
)
@websocket_api.async_response
async def websocket_floors_update(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update an existing floor."""
    floor_registry = fr.async_get(hass)
    floor_id = msg["floor_id"]
    existing_floor = floor_registry.async_get_floor(floor_id)

    if existing_floor is None:
        connection.send_error(msg["id"], "not_found", f"Floor '{floor_id}' not found")
        return

    # Prepare update parameters
    updates = {}

    # Handle name update
    if "name" in msg:
        normalized_name = _normalize_name(msg["name"])
        if not normalized_name:
            connection.send_error(msg["id"], "invalid_name", "Floor name cannot be empty")
            return

        # Check for duplicate name
        for floor in floor_registry.floors.values():
            if floor.floor_id != floor_id and floor.name.casefold() == normalized_name.casefold():
                connection.send_error(
                    msg["id"],
                    "duplicate_name",
                    f"A floor named '{normalized_name}' already exists",
                )
                return
        updates["name"] = normalized_name

    # Handle icon update
    if "icon" in msg:
        updates["icon"] = msg["icon"]

    # Handle level update
    if "level" in msg:
        updates["level"] = msg["level"]

    # Handle aliases update
    if "aliases" in msg:
        updates["aliases"] = set(msg["aliases"])

    try:
        updated_floor = floor_registry.async_update(floor_id, **updates)
    except Exception as err:  # pragma: no cover - defensive logging
        _LOGGER.error("Failed to update floor '%s': %s", floor_id, err)
        connection.send_error(msg["id"], "update_failed", str(err))
        return

    connection.send_result(msg["id"], {"floor": _serialize_floor(updated_floor)})


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_TYPE_FLOORS_DELETE,
        vol.Required("floor_id"): str,
    }
)
@websocket_api.async_response
async def websocket_floors_delete(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Delete a floor."""
    floor_registry = fr.async_get(hass)
    floor_id = msg["floor_id"]

    if floor_registry.async_get_floor(floor_id) is None:
        connection.send_error(msg["id"], "not_found", f"Floor '{floor_id}' not found")
        return

    # Check if any areas are assigned to this floor
    area_registry = ar.async_get(hass)
    areas_in_floor = [
        area for area in area_registry.areas.values() if area.floor_id == floor_id
    ]

    if areas_in_floor:
        connection.send_error(
            msg["id"],
            "floor_in_use",
            f"Cannot delete floor: {len(areas_in_floor)} area(s) are assigned to it",
        )
        return

    try:
        floor_registry.async_delete(floor_id)
    except Exception as err:  # pragma: no cover - defensive logging
        _LOGGER.error("Failed to delete floor '%s': %s", floor_id, err)
        connection.send_error(msg["id"], "delete_failed", str(err))
        return

    connection.send_result(msg["id"], {"success": True, "floor_id": floor_id})
