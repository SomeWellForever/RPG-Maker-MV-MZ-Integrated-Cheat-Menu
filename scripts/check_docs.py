#!/usr/bin/env python3
"""Check that public instructions match the shipped v2.3.1 release."""
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
assert "v2.3.1" in readme
assert "SWF_CheatMenu_MV_MZ_v2.3.1.zip" in readme
assert "**прямо в папку игры**" in readme
assert "**directly into the game folder**" in readme
assert "**сам найдёт игру**" in readme
assert "**detects the game automatically**" in readme
assert "Если архив распакован в другую папку" in readme
assert "If you extracted the ZIP somewhere else" in readme
assert "Устанавливать Python или Go не требуется" in readme
assert "Neither Python nor Go is required" in readme
assert "требуется Python 3" not in readme
assert "Python 3 is required" not in readme
assert "установщик для Mac исключён" not in readme
assert "installer was removed" not in readme
assert "Mac and Xenolauncher:" in readme
assert "Mac и Xenolauncher:" in readme

# Xenolauncher is a separate, optional macOS game launcher, never a dependency.
assert "github.com/m5kro/Xenolauncher" in readme
assert "already patched on Windows or Linux" in readme
assert "уже пропатченную на Windows или Linux" in readme
assert "Game compatibility varies" in workflow
assert "Совместимость зависит от игры" in workflow
assert "installer was withdrawn" not in workflow
assert "Установщик macOS удалён" not in workflow
assert "Xenolauncher" not in installer, "Do not show irrelevant Mac-specific warnings to every installer user"

# The quick overlay remains English; the language switch controls only the full menu.
assert "legacy menu remains in English" in readme
assert "Оно остаётся на английском языке" in readme
assert "Key 1 opens the legacy English quick overlay" in plugin
assert "F7 or the 'Control Menu'" in plugin
assert "Operating system / Операционная система" in issues
assert "emerladCoder" in credits and "NamelessMagician" in credits
assert "extract the ZIP **directly into the game folder**" in workflow
assert "распакуйте ZIP **прямо в папку игры**" in workflow
print("Documentation checks passed: game-root auto-install, external path, RU/EN, Xenolauncher transfer, credits, bug report.")
