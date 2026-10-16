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
