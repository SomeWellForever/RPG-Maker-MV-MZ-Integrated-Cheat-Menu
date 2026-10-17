#!/usr/bin/env python3
"""Validate the exact release ZIP on the CI runner (not needed by end users)."""
from pathlib import Path
from zipfile import ZipFile
root = Path(__file__).resolve().parent.parent
archive = root / "SWF_CheatMenu_MV_MZ_v2.4.1.zip"
required = {
    "SWF_CheatMenu.js", "Setup_Windows.ps1",
    "Install_Windows.cmd", "Remove_Windows.cmd",
    "Install_Linux.sh", "Remove_Linux.sh",
    "README.md", "CREDITS.md",
    "bin/swf-setup-windows-amd64.exe", "bin/swf-setup-windows-arm64.exe",
    "bin/swf-setup-linux-amd64", "bin/swf-setup-linux-arm64",
}
with ZipFile(archive) as z:
    names = set(z.namelist())
    assert names == required, f"Missing {required - names}, unexpected {names - required}"
    assert z.testzip() is None, "Corrupt ZIP archive"
    for filename in ("Install_Linux.sh", "Remove_Linux.sh",
                     "bin/swf-setup-linux-amd64", "bin/swf-setup-linux-arm64"):
        assert ((z.getinfo(filename).external_attr >> 16) & 0o111), f"Non-executable: {filename}"
    plugin = z.read("SWF_CheatMenu.js")
    assert b"SWF Cheat Menu Integrated 2.4.1" in plugin
    assert b"SWF_EN_STRINGS" in plugin and b"swfSetLanguage" in plugin

    assert b"SWF Cheat Menu Integrated v2.4.1" in plugin, "Secondary plugin version not updated"
    assert b"2.2.0" not in plugin, "Old plugin version remains"
    for text_file in ("README.md",):
        assert b"v2.4.1" in z.read(text_file)
    assert b"2.4.1" in z.read("README.md")
    assert "macos" not in " ".join(names).lower(), "Mac installer unexpectedly shipped"
print("Release v2.4.1 verified: 12 files, CRC, both plugin versions, RU/EN, Linux modes, no macOS")

plugin_archive = root / "SWF_CheatMenu_plugin_only_v2.4.1.zip"
with ZipFile(plugin_archive) as z:
    assert set(z.namelist()) == {"SWF_CheatMenu.js", "README_PLUGIN_ONLY.txt"}, "Unexpected plugin-only package content"
    assert z.testzip() is None, "Corrupt plugin-only ZIP"
    assert z.read("SWF_CheatMenu.js") == (root / "SWF_CheatMenu.js").read_bytes(), "Plugin-only source mismatch"
    assert b"v2.4.1" in z.read("README_PLUGIN_ONLY.txt")
print("Plugin-only ZIP verified: 2 files, no executable installers")
