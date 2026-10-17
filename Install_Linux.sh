#!/usr/bin/env bash
# SWF Cheat Menu - Linux launcher. Supports GUI and terminal selection.
HERE="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)" || exit 1
ACTION="install"
ARCH="$(uname -m)"
case "$ARCH" in
  arm64|aarch64) ARCH=arm64 ;;
  x86_64|amd64) ARCH=amd64 ;;
  *) echo "ERROR: Unsupported Linux architecture: $ARCH" >&2; exit 1 ;;
esac
BINARY="$HERE/bin/swf-setup-linux-$ARCH"
if [ ! -f "$BINARY" ]; then
  echo "ERROR: Missing native installer binary: $BINARY. Extract all files from the ZIP." >&2
  exit 1
fi

if [ "$ACTION" = install ] && [ ! -f "$HERE/SWF_CheatMenu.js" ]; then
  echo "ERROR: Installer files are missing. Extract the complete release archive." >&2
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
  if [ -n "$GAME" ]; then echo "Not an RPG Maker MV/MZ game folder; please select another."; fi
  if [ -n "$DISPLAY$WAYLAND_DISPLAY" ] && command -v zenity >/dev/null 2>&1; then
    GAME="$(zenity --file-selection --directory --title="Choose RPG Maker MV/MZ game folder")" || {
      echo "Cancelled. No game files changed."
      exit 0
    }
  elif [ -n "$DISPLAY$WAYLAND_DISPLAY" ] && command -v kdialog >/dev/null 2>&1; then
    GAME="$(kdialog --getexistingdirectory "$HOME" "Choose RPG Maker MV/MZ game folder")" || {
      echo "Cancelled. No game files changed."
      exit 0
    }
  else
    printf 'Enter RPG Maker game folder path (or Ctrl-D to cancel): '
    IFS= read -r GAME || {
      echo "No folder selected; exiting." >&2
      exit 2
    }
    # Remove paired drag-and-drop quotes if pasted by the terminal.
    case "$GAME" in
      \"*\") GAME="$(printf '%s' "$GAME" | sed 's/^"//;s/"$//')" ;;
    esac
  fi
done
printf 'Game folder: %s\n' "$GAME"
"$BINARY" install "$GAME" "$HERE/SWF_CheatMenu.js"
STATUS=$?
if [ "$STATUS" -eq 0 ]; then
  echo "Completed successfully."
else
  echo "ERROR: Operation failed (exit code $STATUS)." >&2
fi
exit "$STATUS"
