#!/usr/bin/env python3
"""Keep concise public documentation accurate for v2.8.0."""
from pathlib import Path

root = Path(__file__).resolve().parent.parent
readme = (root / "README.md").read_text(encoding="utf-8")
workflow = (root / ".github/workflows/release.yml").read_text(encoding="utf-8")
plugin = (root / "SWF_CheatMenu.js").read_text(encoding="utf-8")
installer = (root / "installer/main.go").read_text(encoding="utf-8")
issues = (root / ".github/ISSUE_TEMPLATE/bug_report.yml").read_text(encoding="utf-8")
credits = (root / "CREDITS.md").read_text(encoding="utf-8")
plugin_guide = (root / "README_PLUGIN_ONLY.txt").read_text(encoding="utf-8")
installer_guide = (root / "installer/README.md").read_text(encoding="utf-8")

# All public guides and links describe the same, already-published release.
version = "2.8.0"
for name, data in (("README", readme), ("plugin-only guide", plugin_guide),
                   ("installer guide", installer_guide)):
    assert version in data, f"Wrong release in {name}"
assert f"SWF_CheatMenu_MV_MZ_v{version}.zip" in readme
assert f"SWF_CheatMenu_plugin_only_v{version}.zip" in readme
assert f"SWF_CheatMenu_plugin_only_v{version}.zip" in workflow
assert (root / "CHANGELOG.md").is_file()

# Three languages, both UI modes and the essential commands.
for label in ("## 🇷🇺 Русский", "## 🇬🇧 English", "## 🇪🇸 Español",
              "F7", "English", "Español", "2×3", "Избранное",
              "Favorites", "по категориям", "by category",
              "по значению", "by value", "buscar por valor"):
    assert label.lower() in readme.lower(), f"README missing: {label}"
for label in ("Русский", "English", "Español"):
    assert label in plugin_guide
assert "RU/EN/ES" in credits
assert "emerladCoder" in credits and "NamelessMagician" in credits
assert "SWF_ES_STRINGS" in plugin and "SWF_QUICK_TRANSLATIONS" in plugin
assert "Key 1 opens the localized legacy quick overlay" in plugin
assert "positionSlotCount = 10" in plugin
assert "swfVariableSearch" in plugin and "swfSwitchSearch" in plugin

# Installation must be clear, safe and not imply extra tooling or macOS support.
for label in ("прямо в папку игры", "directly into the game folder",
              "Install_Windows.cmd", "Install_Linux.sh", "Remove_Windows.cmd",
              "Remove_Linux.sh", "SWF_CheatMenu_Backup", "Xenolauncher",
              "already patched on Windows or Linux", "уже пропатченную на Windows или Linux",
              "0", "minus", "10 точек", "ten saved", "diez puntos"):
    assert label.lower() in readme.lower(), f"README missing: {label}"
assert "github.com/m5kro/Xenolauncher" in readme
assert "Enable Cheat Menu" in readme
assert "Python or Go" in readme
assert "Game compatibility varies" in workflow
assert "Совместимость зависит от игры" in workflow
assert "Xenolauncher" not in installer
assert "go -C installer test ./..." in installer_guide

# The documentation-only change must not drop functional regression checks.
for script in ("test_map_minigame.cjs", "test_value_search.cjs",
               "test_refill_items.cjs", "test_quick_teleport.cjs",
               "test_inventory_cap.cjs"):
    assert script in workflow
assert "eval(\"key\"" not in plugin
assert "2147483000" not in plugin
assert "Operating system / Операционная система" in issues
assert "F7 or the 'Control Menu'" in plugin

# Published release archives must never be overwritten by CI.
assert "tags: ['v*.*.*']" in workflow
assert "startsWith(github.ref, 'refs/tags/v')" in workflow
for command in ("gh release upload", "gh release edit", "git push --force", "git tag -f"):
    assert command not in workflow

print("Documentation checks passed: v2.8.0, RU/EN/ES, installation, risks and release safety.")
