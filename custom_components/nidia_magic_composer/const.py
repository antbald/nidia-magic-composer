"""Constants for the Nidia Magic Composer integration."""

# Integration domain
DOMAIN = "nidia_magic_composer"

# Integration name
NAME = "Nidia Magic Composer"

# Version
VERSION = "0.2.1"

# Panel configuration
PANEL_NAME = "nidia-magic-composer"
PANEL_TITLE = "Magic Composer"
PANEL_ICON = "mdi:auto-fix"

# WebSocket command types
WS_TYPE_AREAS_LIST = f"{DOMAIN}/areas/list"
WS_TYPE_AREAS_CREATE = f"{DOMAIN}/areas/create"
WS_TYPE_AREAS_UPDATE = f"{DOMAIN}/areas/update"
WS_TYPE_AREAS_DELETE = f"{DOMAIN}/areas/delete"
WS_TYPE_WIZARD_PREVIEW = f"{DOMAIN}/wizard/preview"
WS_TYPE_WIZARD_APPLY = f"{DOMAIN}/wizard/apply"
WS_TYPE_WIZARD_STATUS = f"{DOMAIN}/wizard/status"

# Service names
SERVICE_WIZARD_PREVIEW = "wizard_preview"
SERVICE_WIZARD_APPLY = "wizard_apply"
SERVICE_CREATE_AREA = "create_area"

# Configuration
CONF_PROFILE_NAME = "profile_name"
CONF_ENABLE_ADVANCED = "enable_advanced"
