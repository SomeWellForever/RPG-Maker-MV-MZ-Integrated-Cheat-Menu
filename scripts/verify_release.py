#!/usr/bin/env python3
"""CI check for published ZIP. Not included in the user-facing archive."""
from pathlib import Path
from zipfile import ZipFile
root=Path(__file__).resolve().parent.parent
archive=root/"SWF_CheatMenu_MV_MZ_v2.2.0.zip"
expected={"SWF_CheatMenu.js","Setup_Windows.ps1","Install_Windows.cmd","Remove_Windows.cmd",
"Install_macOS.command","Remove_macOS.command","Install_Linux.sh","Remove_Linux.sh",
"README.md","CREDITS.md","bin/swf-setup-windows-amd64.exe","bin/swf-setup-windows-arm64.exe",
"bin/swf-setup-macos-arm64","bin/swf-setup-macos-amd64",
"bin/swf-setup-linux-amd64","bin/swf-setup-linux-arm64"}
executables={"Install_macOS.command","Remove_macOS.command","Install_Linux.sh","Remove_Linux.sh",
"bin/swf-setup-macos-arm64","bin/swf-setup-macos-amd64",
"bin/swf-setup-linux-amd64","bin/swf-setup-linux-arm64"}
with ZipFile(archive) as z:
    files=set(z.namelist())
    assert files==expected, f"missing {expected-files}, extra {files-expected}"
    assert z.testzip() is None, "Bad ZIP CRC"
    for name in executables:
        assert (z.getinfo(name).external_attr>>16)&0o111, f"No executable bit: {name}"
    assert b"SWF Cheat Menu Integrated 2.2.0" in z.read("SWF_CheatMenu.js")
print("ZIP contents, CRC and executable bits verified")
