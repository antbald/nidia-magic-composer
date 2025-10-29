"""Config flow for Nidia Magic Composer integration."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers import config_validation as cv

from .const import DOMAIN, CONF_PROFILE_NAME, CONF_ENABLE_ADVANCED

_LOGGER = logging.getLogger(__name__)


class NidiaMagicComposerConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Nidia Magic Composer."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        errors: dict[str, str] = {}

        if user_input is not None:
            # Ensure only one instance of the integration
            await self.async_set_unique_id(DOMAIN)
            self._abort_if_unique_id_configured()

            # Store configuration data
            return self.async_create_entry(
                title="Nidia Magic Composer",
                data=user_input,
            )

        # Define the configuration form schema
        data_schema = vol.Schema(
            {
                vol.Optional(
                    CONF_PROFILE_NAME,
                    default="Default Profile",
                ): cv.string,
                vol.Optional(
                    CONF_ENABLE_ADVANCED,
                    default=False,
                ): cv.boolean,
            }
        )

        return self.async_show_form(
            step_id="user",
            data_schema=data_schema,
            errors=errors,
            description_placeholders={
                "description": "Configure Nidia Magic Composer to automate your Home Assistant setup."
            },
        )

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> NidiaMagicComposerOptionsFlow:
        """Get the options flow for this handler."""
        return NidiaMagicComposerOptionsFlow(config_entry)


class NidiaMagicComposerOptionsFlow(config_entries.OptionsFlow):
    """Handle options flow for Nidia Magic Composer."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialize options flow."""
        self.config_entry = config_entry

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Manage the options."""
        errors: dict[str, str] = {}

        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        # Get current values
        current_profile = self.config_entry.data.get(CONF_PROFILE_NAME, "Default Profile")
        current_advanced = self.config_entry.options.get(CONF_ENABLE_ADVANCED, False)

        data_schema = vol.Schema(
            {
                vol.Optional(
                    CONF_PROFILE_NAME,
                    default=current_profile,
                ): cv.string,
                vol.Optional(
                    CONF_ENABLE_ADVANCED,
                    default=current_advanced,
                ): cv.boolean,
            }
        )

        return self.async_show_form(
            step_id="init",
            data_schema=data_schema,
            errors=errors,
        )
