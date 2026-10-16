"""CLI smoke tests for both POSIX wrappers on Linux and macOS runners."""
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


@unittest.skipUnless(os.name == "posix", "POSIX shell scripts")
class PosixInstallerTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix="swf installer [ ] ")
        self.addCleanup(self.tmp.cleanup)
        self.base = Path(self.tmp.name)
        self.game = self.base / "Gehenna test with spaces 日本語"
        self.js = self.game / "www" / "js"
        (self.js / "plugins").mkdir(parents=True)
        (self.js / "main.js").write_text("PluginManager.setup($plugins);\n", encoding="utf-8")
        (self.js / "plugins.js").write_text('var $plugins = [{"name":"Other","status":true}];', encoding="utf-8")

    def names(self):
        source = (self.js / "plugins.js").read_text(encoding="utf-8")
        return [e["name"] for e in json.loads(source.split("=", 1)[1].strip().rstrip(";"))]

    def run_script(self, script, *args, input=None, env=None):
        e = os.environ.copy()
        e["DISPLAY"] = ""
        e["WAYLAND_DISPLAY"] = ""
        if env:
            e.update(env)
        return subprocess.run(
            ["bash", str(script), *map(str, args)], cwd=self.base,
            input=input, text=True, capture_output=True, env=e, timeout=40
        )

    def test_linux_install_and_remove_with_path(self):
        first = self.run_script(ROOT / "Install_Linux.sh", self.game)
        self.assertEqual(first.returncode, 0, first.stdout + first.stderr)
        self.assertEqual(self.names(), ["Other", "SWF_CheatMenu"])
        second = self.run_script(ROOT / "Remove_Linux.sh", self.game)
        self.assertEqual(second.returncode, 0, second.stdout + second.stderr)
        self.assertEqual(self.names(), ["Other"])

    def test_linux_terminal_folder_prompt(self):
        result = self.run_script(ROOT / "Install_Linux.sh", input=str(self.game) + "\n")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("SWF_CheatMenu", self.names())

    def test_macos_install_and_remove_with_path(self):
        first = self.run_script(ROOT / "Install_macOS.command", self.game)
        self.assertEqual(first.returncode, 0, first.stdout + first.stderr)
        self.assertEqual(self.names(), ["Other", "SWF_CheatMenu"])
        second = self.run_script(ROOT / "Remove_macOS.command", self.game)
        self.assertEqual(second.returncode, 0, second.stdout + second.stderr)
        self.assertEqual(self.names(), ["Other"])

    def test_macos_folder_picker_with_stub(self):
        bindir = self.base / "fake-bin"
        bindir.mkdir()
        script = bindir / "osascript"
        script.write_text('#!/bin/sh\nprintf "%s\\n" "$FAKE_GAME_PATH"\n', encoding="utf-8")
        script.chmod(0o755)
        result = self.run_script(
            ROOT / "Install_macOS.command",
            env={"PATH": str(bindir) + os.pathsep + os.environ.get("PATH", ""),
                 "FAKE_GAME_PATH": str(self.game)},
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("SWF_CheatMenu", self.names())

    def test_removal_works_without_plugin_in_installer_folder(self):
        # A removal launcher must not require the distribution's plugin payload.
        for script in ("Remove_macOS.command", "Remove_Linux.sh"):
            first = self.run_script(ROOT / "Install_Linux.sh", self.game)
            self.assertEqual(first.returncode, 0, first.stdout + first.stderr)
            alternate_release = self.base / ("cleaner-" + script)
            alternate_release.mkdir()
            shutil.copy2(ROOT / "Setup.py", alternate_release / "Setup.py")
            shutil.copy2(ROOT / script, alternate_release / script)
            self.assertFalse((alternate_release / "SWF_CheatMenu.js").exists())
            last = self.run_script(alternate_release / script, self.game)
            self.assertEqual(last.returncode, 0, last.stdout + last.stderr)
            self.assertEqual(self.names(), ["Other"])

    def test_does_not_install_to_invalid_path(self):
        # Never open the real macOS folder picker in unattended CI.
        bindir = self.base / "cancel-bin"
        bindir.mkdir()
        picker = bindir / "osascript"
        picker.write_text("#!/bin/sh\nexit 1\n", encoding="utf-8")
        picker.chmod(0o755)
        env = {"PATH": str(bindir) + os.pathsep + os.environ.get("PATH", "")}
        for script in ("Install_macOS.command", "Install_Linux.sh"):
            result = self.run_script(ROOT / script, self.base / "missing", input="", env=env)
            self.assertFalse((self.base / "missing" / "www").exists())
            self.assertNotIn("SWF_CheatMenu", self.names())

if __name__ == "__main__":
    unittest.main()
