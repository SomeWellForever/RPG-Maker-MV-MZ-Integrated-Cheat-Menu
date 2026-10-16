#!/usr/bin/env python3
"""Audit the exact ZIP published in the SWF Cheat Menu release."""
from pathlib import Path
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parent.parent
ARCHIVE = ROOT / "SWF_CheatMenu_MV_MZ_v2.2.0.zip"
EXPECTED = {
    "SWF_CheatMenu.js",
    "Setup.py",
    "Setup_Windows.ps1",
    "Install_Windows.cmd",
    "Remove_Windows.cmd",
    "Install_macOS.command",
    "Remove_macOS.command",
    "Install_Linux.sh",
    "Remove_Linux.sh",
    "README.md",
    "CREDITS.md",
}
EXECUTABLE = {
    "Install_macOS.command",
    "Remove_macOS.command",
    "Install_Linux.sh",
    "Remove_Linux.sh",
}
with ZipFile(ARCHIVE) as z:
    names = set(z.namelist())
    missing = EXPECTED - names
    unexpected = names - EXPECTED
    assert not missing, f"Missing release files: {sorted(missing)}"
    assert not unexpected, f"Unexpected release files: {sorted(unexpected)}"
    bad = z.testzip()
    assert bad is None, f"Corrupt ZIP member: {bad}"
    for name in EXECUTABLE:
        mode = z.getinfo(name).external_attr >> 16
        assert mode & 0o111, f"Executable permissions missing for {name}"
    assert b"SWF Cheat Menu Integrated 2.2.0" in z.read("SWF_CheatMenu.js"), "Wrong plugin build"
    assert b"Install_Windows.cmd" in z.read("README.md"), "README missing install details"
print(f"Verified {ARCHIVE.name}: {len(EXPECTED)} files, CRC and Unix executable modes OK")
