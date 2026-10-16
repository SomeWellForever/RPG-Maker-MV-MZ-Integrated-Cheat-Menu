import json
import tempfile
import unittest
from pathlib import Path
from Setup import apply

NORMAL_MAIN = "PluginManager.setup($plugins);\nwindow.onload=function(){SceneManager.run(Scene_Boot);};\n"


class SetupTests(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory()
        self.root = Path(self.folder.name)
        self.js = self.root / "www" / "js"
        (self.js / "plugins").mkdir(parents=True)
        (self.js / "main.js").write_text(NORMAL_MAIN)
        self.set_entries([{"name":"OtherPlugin","status":True}])

    def tearDown(self):
        self.folder.cleanup()

    def set_entries(self, entries):
        (self.js / "plugins.js").write_text("var $plugins = "+json.dumps(entries)+";")

    def names(self):
        return [e["name"] for e in json.loads((self.js / "plugins.js").read_text().split("=",1)[1].strip().rstrip(";"))]

    def test_fresh_install_uninstall(self):
        apply(self.root, True)
        self.assertEqual(self.names(), ["OtherPlugin","SWF_CheatMenu"])
        apply(self.root, True)
        self.assertEqual(self.names(), ["OtherPlugin","SWF_CheatMenu"])
        apply(self.root, False)
        self.assertEqual(self.names(), ["OtherPlugin"])

    def test_migration_from_old_integrated_menu(self):
        old = (
            "// BEGIN CHEAT_MENU_INTEGRATED_LOADER\n"
            "$plugins.push({name:'Cheat_Menu',status:true,parameters:{}});\n"
            "// END CHEAT_MENU_INTEGRATED_LOADER\n")
        (self.js / "main.js").write_text(old+NORMAL_MAIN)
        self.set_entries([{"name":"Cheat_Menu","status":True}, {"name":"OtherPlugin","status":True}])
        apply(self.root, True)
        self.assertEqual(self.names(), ["OtherPlugin","SWF_CheatMenu"])
        self.assertNotIn("INTEGRATED_LOADER", (self.js / "main.js").read_text())

    def test_leave_unrelated_menu_alone(self):
        self.set_entries([{"name":"Cheat_Menu","status":True,"description":"Other developer"}])
        apply(self.root, True)
        self.assertEqual(self.names(), ["Cheat_Menu","SWF_CheatMenu"])


    def test_mz_layout_and_backup(self):
        mz = self.root / "js"
        (mz / "plugins").mkdir(parents=True)
        (mz / "main.js").write_text(NORMAL_MAIN)
        (mz / "plugins.js").write_text('var $plugins = [{"name":"MZOther","status":true}];')
        # Ensure the MZ root layout is correctly detected independently.
        old_mv = self.root / "www"
        relocated = self.root / "_old_www"
        old_mv.rename(relocated)
        try:
            apply(self.root, True)
            self.assertTrue((mz / "plugins" / "SWF_CheatMenu.js").exists())
            self.assertIn("SWF_CheatMenu", (mz / "plugins.js").read_text())
            backups = list((self.root / "SWF_CheatMenu_Backup").glob("*/js/plugins.js"))
            self.assertGreater(len(backups), 0, "Expected backup of existing registration")
            apply(self.root, False)
            self.assertNotIn("SWF_CheatMenu", (mz / "plugins.js").read_text())
        finally:
            relocated.rename(old_mv)

    def test_removal_without_distribution_plugin(self):
        apply(self.root, True)
        # Remove the plugin file from the installer only in a copied Setup.py
        # to ensure uninstall does not depend on a payload.
        import shutil
        cleaner = self.root / "cleaner"
        cleaner.mkdir()
        shutil.copy2(Path(__file__).resolve().parent.parent / "Setup.py", cleaner / "Setup.py")
        import subprocess
        result = subprocess.run(
            [__import__("sys").executable, str(cleaner / "Setup.py"), "remove", str(self.root)],
            capture_output=True, text=True
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertNotIn("SWF_CheatMenu", self.names())

    def test_nested_plugin_parameters(self):
        self.set_entries([{
            "name": "ComplexPlugin",
            "status": True,
            "parameters": {
                "nested": ["a", "b"],
                "label": "Contains [brackets] and ] characters",
                "json": "[1, 2, 3]"
            }
        }])
        apply(self.root, True)
        self.assertEqual(self.names(), ["ComplexPlugin", "SWF_CheatMenu"])
        apply(self.root, False)
        self.assertEqual(self.names(), ["ComplexPlugin"])

    def test_migrate_registry_after_xenolauncher_deleted_old_file(self):
        self.set_entries([
            {"name": "Cheat_Menu", "status": True, "description": "Integrated Cheat Menu"},
            {"name": "Unrelated", "status": True}
        ])
        apply(self.root, True)
        self.assertEqual(self.names(), ["Unrelated", "SWF_CheatMenu"])

if __name__ == "__main__":
    unittest.main()
