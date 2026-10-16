#!/usr/bin/env python3
"""Build-only tool; users do not need Python."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root = Path(__file__).resolve().parent.parent
names = [
  "SWF_CheatMenu.js", "Setup_Windows.ps1",
  "Install_Windows.cmd", "Remove_Windows.cmd",
  "Install_macOS.command", "Remove_macOS.command",
  "Install_Linux.sh", "Remove_Linux.sh", "README.md", "CREDITS.md",
  "bin/swf-setup-windows-amd64.exe", "bin/swf-setup-windows-arm64.exe",
  "bin/swf-setup-macos-arm64", "bin/swf-setup-macos-amd64",
  "bin/swf-setup-linux-amd64", "bin/swf-setup-linux-arm64",
]
out = root / "SWF_CheatMenu_MV_MZ_v2.2.0.zip"
with ZipFile(out, "w", ZIP_DEFLATED) as archive:
    for name in names:
        archive.write(root / name, name)
print(out)
