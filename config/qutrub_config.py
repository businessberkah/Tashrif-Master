#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
#  qutrub_config.py
#
import os

# ── Repo root (two levels up from this file: config/ → root) ──────────────
_REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# ── Database base path ────────────────────────────────────────────────────
# Override with env var QUTRUB_DB_BASE (must point to the repo root that
# contains the data/ directory).
DB_BASE_PATH = os.environ.get("QUTRUB_DB_BASE", _REPO_ROOT)

# ── Logging ───────────────────────────────────────────────────────────────
_DEFAULT_LOG_DIR = os.path.join(_REPO_ROOT, "logs")
_DEFAULT_LOG_FILE = os.path.join(_DEFAULT_LOG_DIR, "demo.log")

LOGGING_CFG_FILE = os.path.join(_REPO_ROOT, "config", "logging.cfg")
LOGGING_FILE = os.environ.get("QUTRUB_LOG_FILE", _DEFAULT_LOG_FILE)

# Create log directory if it does not exist
try:
    os.makedirs(os.path.dirname(LOGGING_FILE), exist_ok=True)
except OSError:
    pass  # best-effort; logging may fall back to stderr

# ── Debug mode ────────────────────────────────────────────────────────────
# Default is False for production safety.
# Set env var QUTRUB_DEBUG=1 to enable debug logging.
MODE_DEBUG = os.environ.get("QUTRUB_DEBUG", "0") == "1"


def main(args):
    return 0


if __name__ == '__main__':
    import sys
    sys.exit(main(sys.argv))
