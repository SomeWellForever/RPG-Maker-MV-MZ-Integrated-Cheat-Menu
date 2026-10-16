#!/usr/bin/env python3
"""Installer and migration helper for SWF Cheat Menu (RPG Maker MV/MZ)."""
import argparse
import datetime
import json
import re
import shutil
import sys
from pathlib import Path

NAME = "SWF_CheatMenu"
FILE = NAME + ".js"
OLD = "Cheat_Menu"
OLD_START = "// BEGIN CHEAT_MENU_INTEGRATED_LOADER"
RE = re.compile(r"((?:var|let|const)\s+\$plugins\s*=\s*)(\[[\s\S]*?\])(\s*;)", re.M)
OLD_BLOCK = re.compile(r"^[ \t]*// BEGIN CHEAT_MENU_INTEGRATED_LOADER[^\n]*\n[\s\S]*?^[ \t]*// END CHEAT_MENU_INTEGRATED_LOADER[^\n]*(?:\n|$)", re.M)
NEW_BLOCK = re.compile(r"^[ \t]*// BEGIN SWF_CHEATMENU_LOADER[^\n]*\n[\s\S]*?^[ \t]*// END SWF_CHEATMENU_LOADER[^\n]*(?:\n|$)", re.M)
OLD_LOAD = re.compile(r"^[ \t]*PluginManager\.loadScript\(\s*['\"]Cheat_Menu\.js['\"]\s*\)\s*;?[ \t]*(?:\n|$)", re.M)


def locate(root):
    root = Path(root).expanduser().resolve()
    for js in (root / "www" / "js", root / "js"):
        if (js / "main.js").is_file() and (js / "plugins.js").is_file():
            return root, js
    raise ValueError("Choose the game folder containing www/js/main.js and plugins.js (or js/).")


def backup(root, paths):
    files = sorted({p for p in paths if p.is_file()})
    if not files:
        return None
    target = root / "SWF_CheatMenu_Backup" / datetime.datetime.now().strftime("%Y%m%d-%H%M%S-%f")
    for src in files:
        dest = target / src.relative_to(root)
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dest)
    return target


def legacy_is_ours(js, main):
    if OLD_START in main:
        return True
    old = js / "plugins" / "Cheat_Menu.js"
    if old.is_file():
        source = old.read_text(encoding="utf-8", errors="replace")[:3000]
        return "Cheat Menu Integrated" in source
    return False


def registry_edit(source, installing, ours):
    match = RE.search(source)
    if match is None:
        return None
    try:
        plugins = json.loads(match.group(2))
        if not isinstance(plugins, list):
            return None
    except (ValueError, TypeError):
        return None
    new = []
    for entry in plugins:
        if not isinstance(entry, dict):
            new.append(entry)
            continue
        name = entry.get("name")
        if name == NAME:
            continue
        desc = str(entry.get("description", ""))
        if installing and name == OLD and (ours or "Integrated Cheat Menu" in desc or "Cheat Menu Integrated" in desc):
            continue
        new.append(entry)
    if installing:
        new.append({"name": NAME, "status": True, "description": "SWF Cheat Menu Integrated 2.2.0", "parameters": {}})
    return source[:match.start(2)] + json.dumps(new, ensure_ascii=False, indent=4) + source[match.end(2):]


def main_edit(source, installing, has_registry, ours):
    result = OLD_BLOCK.sub("", source)
    result = NEW_BLOCK.sub("", result)
    if ours:
        result = OLD_LOAD.sub("", result)
    if installing and not has_registry:
        lines = ["// BEGIN SWF_CHEATMENU_LOADER",
            "for (var swfI=$plugins.length-1; swfI>=0; --swfI) {",
            " var swfP=$plugins[swfI];",
            " if (swfP && swfP.name==='SWF_CheatMenu') $plugins.splice(swfI,1);"]
        if ours:
            lines.append(" if (swfP && swfP.name==='Cheat_Menu') $plugins.splice(swfI,1);")
        lines.extend(["}",
            "$plugins.push({name:'SWF_CheatMenu',status:true,description:'SWF Cheat Menu Integrated 2.2.0',parameters:{}});",
            "// END SWF_CHEATMENU_LOADER"])
        marker = "PluginManager.setup($plugins);"
        if marker not in result:
            raise ValueError("Cannot locate PluginManager.setup($plugins) in main.js.")
        result = result.replace(marker, "\n".join(lines) + "\n" + marker, 1)
    return result


def apply(game, installing):
    root, js = locate(game)
    main = js / "main.js"
    registry = js / "plugins.js"
    dest = js / "plugins" / FILE
    src = Path(__file__).resolve().parent / FILE
    if installing and not src.is_file():
        raise ValueError("Installer is missing " + FILE)
    main_source = main.read_text(encoding="utf-8-sig")
    registry_source = registry.read_text(encoding="utf-8-sig")
    ours = legacy_is_ours(js, main_source)
    new_reg = registry_edit(registry_source, installing, ours)
    new_main = main_edit(main_source, installing, new_reg is not None, ours)
    changes = {}
    if new_reg is not None and new_reg != registry_source:
        changes[registry] = new_reg
    if new_main != main_source:
        changes[main] = new_main
    if installing:
        data = src.read_bytes()
        if not dest.is_file() or dest.read_bytes() != data:
            changes[dest] = data
    elif dest.is_file() and "@plugindesc SWF Cheat Menu Integrated" in dest.read_text(encoding="utf-8",errors="replace")[:300]:
        changes[dest] = None
    if not changes:
        print("No changes needed.")
        return
    location = backup(root, changes.keys())
    for file, contents in changes.items():
        if contents is None:
            file.unlink()
        else:
            file.parent.mkdir(parents=True, exist_ok=True)
            file.write_text(contents, encoding="utf-8") if isinstance(contents, str) else file.write_bytes(contents)
    print(("Installed " if installing else "Removed ") + FILE)
    if location:
        print("Backup: " + str(location))
    if new_reg is None:
        print("Nonstandard plugins.js detected: using guarded main.js loader.")
    if not ours and OLD in registry_source:
        print("Note: an unrelated Cheat_Menu registration was preserved.")
    print("Keep Xenolauncher's built-in Cheat Menu disabled.")


if __name__ == "__main__":
    args = argparse.ArgumentParser()
    args.add_argument("action", choices=("install","remove"))
    args.add_argument("game", nargs="?", default=str(Path(__file__).resolve().parent))
    opt = args.parse_args()
    try:
        apply(opt.game, opt.action == "install")
    except (ValueError, OSError) as exc:
        print("ERROR:", exc, file=sys.stderr)
        sys.exit(1)
