#!/usr/bin/env bash
set -e
HERE="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
if [ "$#" -gt 0 ]; then exec python3 "$HERE/Setup.py" install "$1"; fi
exec python3 "$HERE/Setup.py" install "$HERE"
