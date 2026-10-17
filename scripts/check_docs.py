#!/usr/bin/env python3
"""Check that public instructions match the shipped v2.7.0 release."""
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
assert "v2.7.0" in readme
assert "SWF_CheatMenu_MV_MZ_v2.7.0.zip" in readme
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
assert "Compatibility depends on the game and its plugins" in readme
assert "Совместимость зависит от игры" in workflow
assert "Совместимость зависит от игры и её плагинов" in readme
assert "installer was withdrawn" not in workflow
assert "Установщик macOS удалён" not in workflow
assert "Xenolauncher" not in installer, "Do not show irrelevant Mac-specific warnings to every installer user"

# The same RU/EN/ES setting must control both menus, including the quick overlay.
assert "быстрое меню переключаются" in readme
assert "quick menu use the same language" in readme
assert "Key 1 opens the localized legacy quick overlay" in plugin
assert "Español" in readme and "Español" in plugin
assert "SWF_ES_STRINGS" in plugin and "SWF_QUICK_TRANSLATIONS" in plugin
assert "мини-игр" in readme
assert "mini-game" in readme
assert "test_map_minigame.cjs" in workflow
assert "test_value_search.cjs" in workflow
assert "test_refill_items.cjs" in workflow
assert "Пополнить имеющиеся обычные предметы" in plugin
assert "Owned-item refill" in readme
assert "уже имеющихся" in readme
assert "по значению" in readme
assert "by value" in readme
assert "buscar por valor" in readme
assert "swfVariableSearch" in plugin and "swfSwitchSearch" in plugin
assert "F7 or the 'Control Menu'" in plugin
assert "Operating system / Операционная система" in issues
assert "emerladCoder" in credits and "NamelessMagician" in credits
assert "extract the ZIP **directly into the game folder**" in workflow
assert "распакуйте ZIP **прямо в папку игры**" in workflow
assert "go -C installer test ./..." in (root / "installer/README.md").read_text(encoding="utf-8")
assert "v2.7.0" in (root / "installer/README.md").read_text(encoding="utf-8")
assert "CHANGELOG.md" in readme
assert "Поиск и прокрутка" in readme
assert "Search and scrolling" in readme
assert "Избранное" in readme
assert "по категориям" in readme
assert "by category" in readme
assert "Favorites" in readme
assert "2×3" in readme
assert "two-column" in readme
assert "SWF_CheatMenu_plugin_only_v2.7.0.zip" in readme
assert "SWF_CheatMenu_plugin_only_v2.7.0.zip" in workflow
assert "2147483000" not in plugin  # Persistent 2.4.0 search overlay must not return.
assert "без установщика" in readme
assert "Plugin-only alternative" in readme
assert (root / "README_PLUGIN_ONLY.txt").exists()
assert (root / "CHANGELOG.md").is_file()
# A branch push or PR may build artifacts but must never rewrite published releases.
assert "tags: ['v*.*.*']" in workflow
assert "startsWith(github.ref, 'refs/tags/v')" in workflow
for destructive in ("gh release upload", "gh release edit", "git push --force", "git tag -f"):
    assert destructive not in workflow, f"Workflow can rewrite a release: {destructive}"
print("Documentation checks passed: game-root auto-install, external path, RU/EN/ES, Xenolauncher transfer, credits, bug report.")
