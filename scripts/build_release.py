#!/usr/bin/env python3
"""Build the release ZIP in CI; end users do not need Python or Go."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root = Path(__file__).resolve().parent.parent
members = [
    "SWF_CheatMenu.js", "Setup_Windows.ps1",
    "Install_Windows.cmd", "Remove_Windows.cmd",
    "Install_Linux.sh", "Remove_Linux.sh",
    "README.md", "CREDITS.md",
    "bin/swf-setup-windows-amd64.exe", "bin/swf-setup-windows-arm64.exe",
    "bin/swf-setup-linux-amd64", "bin/swf-setup-linux-arm64",
]
archive = root / "SWF_CheatMenu_MV_MZ_v2.6.0.zip"
with ZipFile(archive, "w", ZIP_DEFLATED) as z:
    for member in members:
        if not (root / member).is_file():
            raise FileNotFoundError(member)
        z.write(root / member, member)
print(archive)

# Plain JavaScript distribution for updating an already-patched game.
# This does not contain .exe, PowerShell, Go binaries, or installer scripts.
plugin_archive = root / "SWF_CheatMenu_plugin_only_v2.6.0.zip"
with ZipFile(plugin_archive, "w", ZIP_DEFLATED) as z:
    for member in ("SWF_CheatMenu.js", "README_PLUGIN_ONLY.txt"):
        z.write(root / member, member)
print(plugin_archive)
