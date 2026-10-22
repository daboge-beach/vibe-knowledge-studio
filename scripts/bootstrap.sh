#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export TMPDIR="$PWD/.tmp" TEMP="$PWD/.tmp" TMP="$PWD/.tmp"
export PIP_CACHE_DIR="$PWD/.cache/pip" PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright"
export PYTHONDONTWRITEBYTECODE=1
mkdir -p "$TMPDIR" "$PIP_CACHE_DIR" "$PLAYWRIGHT_BROWSERS_PATH"
"${PYTHON:-python3}" -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m playwright install chromium
.venv/bin/python tools/studio.py prepare
.venv/bin/python tools/studio.py doctor
