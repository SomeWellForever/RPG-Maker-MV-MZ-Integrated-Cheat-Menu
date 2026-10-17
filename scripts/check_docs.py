#!/usr/bin/env python3
"""Check that public instructions match the shipped v2.3.0 release."""
from pathlib import Path

root = Path(__file__).resolve().parent.parent
readme = (root / "README.md").read_text(encoding="utf-8")
workflow = (root / ".github/workflows/release.yml").read_text(encoding="utf-8")
plugin = (root / "SWF_CheatMenu.js").read_text(encoding="utf-8")
installer = (root / "installer/main.go").read_text(encoding="utf-8")
issues = (root / ".github/ISSUE_TEMPLATE/bug_report.yml").read_text(encoding="utf-8")
credits = (root / "CREDITS.md").read_text(encoding="utf-8")

for language in ("Русский", "English"):
    assert language in readme, f"Missing language instructions: {language}"
assert "v2.3.0" in readme
assert "SWF_CheatMenu_MV_MZ_v2.3.0.zip" in readme
assert "www/js/plugins/" in readme and "js/plugins/" in readme
assert "plugins.js" in readme
assert "bin" in readme
assert "Python и Go устанавливать не нужно" in readme
assert "Python and Go are not required" in readme
assert "требуется Python 3" not in readme
assert "Python 3 is required" not in readme
assert "macOS is not supported" in readme and "macOS не поддерживается" in readme

# Xenolauncher is a separate, optional macOS game launcher, never a dependency.
assert "github.com/m5kro/Xenolauncher" in readme
assert "Xenolauncher is not required" in readme
assert "Xenolauncher не требуется" in readme
assert "Optional compatibility" in workflow
assert "Только для пользователей Xenolauncher" in workflow
assert "Xenolauncher" not in installer, "Do not show irrelevant Mac-specific warnings to every installer user"

# The quick overlay remains English; the language switch controls only the full menu.
assert "legacy menu remains in English" in readme
assert "Оно остаётся на английском языке" in readme
assert "Key 1 opens the legacy English quick overlay" in plugin
assert "F7 or the 'Control Menu'" in plugin
assert "Operating system / Операционная система" in issues
assert "emerladCoder" in credits and "NamelessMagician" in credits
print("Documentation checks passed: platforms, install paths, language scope, credits, optional launcher, bug report.")
