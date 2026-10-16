#!/bin/bash
# SWF Cheat Menu - macOS launcher. The game may be anywhere on disk.
HERE="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)" || exit 1

if [ ! -f "$HERE/Setup.py" ] || [ ! -f "$HERE/SWF_CheatMenu.js" ]; then
  echo "ERROR: Installer files are missing. Extract the complete release archive."
  exit 1
fi
if ! command -v python3 >/dev/null 2>&1; then
  echo "ERROR: Python 3 is required. Install it and try again."
  exit 1
fi

is_game() {
  [ -d "$1" ] && {
    { [ -f "$1/www/js/main.js" ] && [ -f "$1/www/js/plugins.js" ]; } ||
    { [ -f "$1/js/main.js" ] && [ -f "$1/js/plugins.js" ]; }
  }
}

GAME=""
if [ "$#" -gt 0 ]; then GAME="$1"; fi
if [ -z "$GAME" ] && is_game "$HERE"; then GAME="$HERE"; fi
while ! is_game "$GAME"; do
  if [ -n "$GAME" ]; then echo "That folder does not contain RPG Maker MV/MZ game files. Try again."; fi
  if command -v osascript >/dev/null 2>&1; then
    GAME="$(osascript -e 'POSIX path of (choose folder with prompt "Choose your RPG Maker MV/MZ game folder")' 2>/dev/null)" || {
      echo "Folder selection cancelled. No game files changed."
      exit 0
    }
  else
    printf 'Enter game folder path (or Ctrl-D to cancel): '
    IFS= read -r GAME || exit 1
  fi
done
printf 'Game folder: %s\n' "$GAME"
python3 "$HERE/Setup.py" install "$GAME"
STATUS=$?
if [ "$STATUS" -eq 0 ]; then
  echo "Completed successfully."
else
  echo "ERROR: Operation failed (exit code $STATUS). See details above."
fi
if [ -t 0 ]; then
  printf 'Press Return to close this window...'
  IFS= read -r _ || true
fi
exit "$STATUS"
