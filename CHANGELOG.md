# 📋 Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/).

## \[1.0.0] – 2025-05-27

> First public release of AI Secretary Bot, a modular and production-ready assistant for Spanish-speaking users, integrating Telegram, Google Calendar, and OpenAI LLMs.

### Added

- **Telegram Bot integration**: receive and send messages in Spanish, no commands required, full support for natural language (including date and time parsing).

- **Google Calendar integration**:

    - OAuth2 token management (multi-account read support; create and delete events only in the calendar defined by `GOOGLE_CALENDAR_ID`).
    - Script for interactive credential/token generation.

- **OpenAI LLM integration**:

    - All prompts and service logic in Spanish, with customizable prompt templates for clarify, confirm, resolve, delete, and evaluate.
    - Robust handling of JSON-only responses and fallback for ambiguous input.

- **Daily automatic agenda sending**:

    - Uses `node-cron` to send a summary of upcoming events each day at the time defined by the `CRON_TIME` environment variable.

- **Fully modular project architecture** (clean architecture, separation of domain, application, infrastructure, presentation).

- **Secure environment variable setup**:

    - Example `.env` provided, all sensitive fields blank.
    - `.gitignore` prevents leakage of credentials and tokens.

- **Testing**:

    - Jest setup with mocks for OpenAI, Google APIs, cron jobs, and Telegram.
    - Unit tests for all LLM and calendar services.

- **Professional documentation**:

    - Spanish `README` with onboarding, configuration, troubleshooting, testing and guidelines.
    - Prompts documented and ready for prompt engineering.

- **MIT license** included.

### Notes

- The bot only supports **creating and deleting** events in one main calendar (`GOOGLE_CALENDAR_ID`), while all linked Google accounts' primary calendars are read-only for event queries.
- All configuration is done via environment variables for maximum portability.
- No support for modifying existing events (yet).
- The design is modular and extensible for additional LLMs, more providers, or advanced workflow automation.
