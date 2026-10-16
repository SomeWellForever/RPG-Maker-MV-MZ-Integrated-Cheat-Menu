#!/bin/bash
set -e
HERE="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
if ! command -v python3 >/dev/null; then
  osascript -e 'display alert "Python 3 required" message "Install Python 3 and retry."'
  exit 1
fi
if [ "$#" -gt 0 ]; then
  GAME="$1"
else
  GAME="$(osascript -e 'POSIX path of (choose folder with prompt "Choose RPG Maker game folder containing Game.exe or www")')" || exit 0
fi
python3 "$HERE/Setup.py" install "$GAME"
echo "Press Return to close."
read -r _
