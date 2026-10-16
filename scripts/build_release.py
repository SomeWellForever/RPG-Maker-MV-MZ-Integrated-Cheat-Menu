#!/usr/bin/env python3
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root = Path(__file__).resolve().parent.parent
names = ["SWF_CheatMenu.js", "Setup.py", "Install_Windows.cmd", "Remove_Windows.cmd", "Setup_Windows.ps1",
         "Install_macOS.command", "Remove_macOS.command", "Install_Linux.sh",
         "Remove_Linux.sh", "README.md", "CREDITS.md"]
archive = root / "SWF_CheatMenu_MV_MZ_v2.2.0.zip"
with ZipFile(archive, "w", ZIP_DEFLATED) as z:
    for name in names:
        z.write(root / name, name)
print(archive)
