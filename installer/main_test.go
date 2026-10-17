package main

import (
    "bytes"
    "encoding/json"
    "os"
    "path/filepath"
    "strings"
    "testing"
)

func fixture(t *testing.T, mz bool) (string, string, string) {
    t.Helper()
    root := t.TempDir()
    js := filepath.Join(root, "www", "js")
    if mz { js = filepath.Join(root, "js") }
    if err := os.MkdirAll(filepath.Join(js, "plugins"), 0o755); err != nil { t.Fatal(err) }
    if err := os.WriteFile(filepath.Join(js, "main.js"), []byte("PluginManager.setup($plugins);\n"), 0o644); err != nil { t.Fatal(err) }
    reg := `var $plugins = [{"name":"OtherPlugin","status":true,"parameters":{"nested":[1,2,3],"bracket":"hello ] world"}}];`
    if err := os.WriteFile(filepath.Join(js, "plugins.js"), []byte(reg), 0o644); err != nil { t.Fatal(err) }
    payload := filepath.Join(root, "source.js")
    if err := os.WriteFile(payload, []byte("/* @plugindesc SWF Cheat Menu Integrated 2.7.1 */\n"), 0o644); err != nil { t.Fatal(err) }
    return root, js, payload
}

func names(t *testing.T, js string) []string {
    t.Helper()
    data, err := os.ReadFile(filepath.Join(js, "plugins.js"))
    if err != nil { t.Fatal(err) }
    records, ok := readRegistry(data)
    if !ok { t.Fatalf("registry invalid after install: %s", data) }
    out := []string{}
    for _, r := range records {
        var e struct { Name string `json:"name"` }
        if err := json.Unmarshal(r, &e); err != nil { t.Fatal(err) }
        out = append(out, e.Name)
    }
    return out
}

func checkNames(t *testing.T, js string, expected ...string) {
    t.Helper()
    got := strings.Join(names(t, js), ",")
    want := strings.Join(expected, ",")
    if got != want { t.Fatalf("plugin names: got %q, expected %q", got, want) }
}

func TestInstallAndRemoveMVandMZ(t *testing.T) {
    for _, mz := range []bool{false,true} {
        root, js, payload := fixture(t, mz)
        var log bytes.Buffer
        if err := run([]string{"install",root,payload}, &log); err != nil { t.Fatal(err) }
        checkNames(t, js, "OtherPlugin", "SWF_CheatMenu")
        if err := run([]string{"install",root,payload}, &log); err != nil { t.Fatal(err) }
        checkNames(t, js, "OtherPlugin", "SWF_CheatMenu")
        backups, _ := filepath.Glob(filepath.Join(root, "SWF_CheatMenu_Backup", "*"))
        if len(backups)==0 { t.Fatal("no backup recorded") }
        if err := os.Remove(payload); err != nil { t.Fatal(err) }
        if err := run([]string{"remove",root}, &log); err != nil { t.Fatal(err) }
        checkNames(t, js, "OtherPlugin")
        if _, err := os.Stat(filepath.Join(js,"plugins",pluginFile)); !os.IsNotExist(err) { t.Fatal("payload still present") }
    }
}

func TestUpdateFrom220To271PreservesBackupsAndOtherPlugins(t *testing.T) {
    root, js, payload := fixture(t, false)
    previous := []byte("/* @plugindesc SWF Cheat Menu Integrated 2.2.0 */\n// old release\n")
    destination := filepath.Join(js, "plugins", pluginFile)
    if err := os.WriteFile(destination, previous, 0o644); err != nil { t.Fatal(err) }
    if err := os.WriteFile(filepath.Join(js, "plugins.js"), []byte(
        "var $plugins = [{\"name\":\"OtherPlugin\",\"status\":true},{\"name\":\"SWF_CheatMenu\",\"status\":true,\"description\":\"SWF Cheat Menu Integrated 2.2.0\"}];"), 0o644); err != nil { t.Fatal(err) }
    if err := run([]string{"install", root, payload}, os.Stdout); err != nil { t.Fatal(err) }
    checkNames(t, js, "OtherPlugin", "SWF_CheatMenu")
    installed, err := os.ReadFile(destination)
    if err != nil { t.Fatal(err) }
    if !bytes.Contains(installed, []byte("2.7.1")) { t.Fatal("old plugin was not upgraded") }
    backups, err := filepath.Glob(filepath.Join(root, "SWF_CheatMenu_Backup", "*", "www", "js", "plugins", pluginFile))
    if err != nil || len(backups) != 1 { t.Fatalf("expected exactly one old plugin backup: %v %v", backups, err) }
    stored, err := os.ReadFile(backups[0])
    if err != nil || !bytes.Equal(stored, previous) { t.Fatal("old plugin backup differs from original") }
    backupsBefore, err := filepath.Glob(filepath.Join(root, "SWF_CheatMenu_Backup", "*"))
    if err != nil { t.Fatal(err) }
    if err := run([]string{"install", root, payload}, os.Stdout); err != nil { t.Fatal(err) }
    backupsAfter, err := filepath.Glob(filepath.Join(root, "SWF_CheatMenu_Backup", "*"))
    if err != nil || len(backupsAfter) != len(backupsBefore) { t.Fatal("repeated install made unnecessary backups") }
}

func TestUnicodePath(t *testing.T) {
    root, js, payload := fixture(t, false)
    newRoot:=filepath.Join(filepath.Dir(root), "日本語 [тест] directory")
    if err:=os.Rename(root,newRoot);err!=nil{t.Fatal(err)}
    root=newRoot
    js=filepath.Join(root,"www","js")
    payload=filepath.Join(root,"source.js")
    if err:=run([]string{"install",root,payload},os.Stdout);err!=nil{t.Fatal(err)}
    checkNames(t,js,"OtherPlugin","SWF_CheatMenu")
}

func TestLegacyRegistrationRemovedEvenIfOldPluginFileIsMissing(t *testing.T) {
    root,js,payload:=fixture(t,false)
    old:=`var $plugins = [{"name":"Cheat_Menu","status":true,"description":"Integrated Cheat Menu"},{"name":"OtherPlugin","status":true}];`
    os.WriteFile(filepath.Join(js,"plugins.js"),[]byte(old),0o644)
    main:=`// BEGIN CHEAT_MENU_INTEGRATED_LOADER
$plugins.push({name:'Cheat_Menu',status:true});
 // END CHEAT_MENU_INTEGRATED_LOADER
PluginManager.setup($plugins);
`
    // Use canonical block marker without leading whitespace to mimic original.
    main=strings.Replace(main," // END","// END",1)
    os.WriteFile(filepath.Join(js,"main.js"),[]byte(main),0o644)
    if err:=run([]string{"install",root,payload},os.Stdout);err!=nil{t.Fatal(err)}
    checkNames(t,js,"OtherPlugin","SWF_CheatMenu")
    actual,_:=os.ReadFile(filepath.Join(js,"main.js"))
    if bytes.Contains(actual,[]byte("CHEAT_MENU_INTEGRATED_LOADER")) {t.Fatal("old loader not cleaned up")}
}

func TestUnrelatedOldPluginPreserved(t *testing.T) {
    root,js,payload:=fixture(t,false)
    reg:=`var $plugins = [{"name":"Cheat_Menu","status":true,"description":"Completely different plugin"}];`
    os.WriteFile(filepath.Join(js,"plugins.js"),[]byte(reg),0o644)
    if err:=run([]string{"install",root,payload},os.Stdout);err!=nil{t.Fatal(err)}
    checkNames(t,js,"Cheat_Menu","SWF_CheatMenu")
}


func TestUpgradeDisablesBlankDescriptionLegacyAndPreservesSettings(t *testing.T) {
    for _, mz := range []bool{false, true} {
        root, js, payload := fixture(t, mz)
        // Regression: both legacy and SWF were active, but the old description was empty.
        reg := `var $plugins = [
            {"name":"OtherPlugin","status":true,"parameters":{"nested":[1,2,3],"message":"keep me"}},
            {"name":"Cheat_Menu","status":true,"description":"","parameters":{"custom":"preserve"}},
            {"name":"AnotherPlugin","status":false,"parameters":{"value":10}},
            {"name":"SWF_CheatMenu","status":true,"description":"SWF Cheat Menu Integrated 2.3.0","parameters":{}}
        ];`
        if err := os.WriteFile(filepath.Join(js, "plugins.js"), []byte(reg), 0o644); err != nil { t.Fatal(err) }
        if err := run([]string{"install", root, payload}, os.Stdout); err != nil { t.Fatal(err) }
        records, ok := readRegistry(mustRead(t, filepath.Join(js, "plugins.js")))
        if !ok { t.Fatal("registry cannot be parsed") }
        if len(records) != 4 { t.Fatalf("unexpected plugin count: %d", len(records)) }
        activeSWF, activeLegacy := 0, 0
        for _, raw := range records {
            var entry struct {
                Name string `json:"name"`
                Status bool `json:"status"`
                Description string `json:"description"`
                Parameters map[string]interface{} `json:"parameters"`
            }
            if err := json.Unmarshal(raw, &entry); err != nil { t.Fatal(err) }
            switch entry.Name {
            case "Cheat_Menu":
                if entry.Status { activeLegacy++ }
                if entry.Description != "" || entry.Parameters["custom"] != "preserve" {
                    t.Fatal("legacy settings not preserved")
                }
            case "SWF_CheatMenu":
                if entry.Status { activeSWF++ }
                if entry.Description != "SWF Cheat Menu Integrated 2.7.1" { t.Fatal("incorrect new version") }
            case "OtherPlugin":
                if !entry.Status || entry.Parameters["message"] != "keep me" { t.Fatal("other plugin modified") }
            case "AnotherPlugin":
                if entry.Status || entry.Parameters["value"] != float64(10) { t.Fatal("disabled plugin modified") }
            default:
                t.Fatalf("unexpected plugin: %s", entry.Name)
            }
        }
        if activeSWF != 1 || activeLegacy != 0 { t.Fatalf("conflict remains: SWF=%d legacy=%d", activeSWF, activeLegacy) }
        // Both MV (www/js) and MZ (js) backups must contain the exact pre-update registry.
        relative, err := filepath.Rel(root, filepath.Join(js, "plugins.js"))
        if err != nil { t.Fatal(err) }
        pattern := filepath.Join(root, "SWF_CheatMenu_Backup", "*", relative)
        backups, err := filepath.Glob(pattern)
        if err != nil || len(backups) != 1 {
            t.Fatalf("expected one registry backup; got %v (error: %v)", backups, err)
        }
        if !bytes.Equal(mustRead(t, backups[0]), []byte(reg)) {
            t.Fatal("backup does not contain the original plugins.js")
        }
        // Repeat installation must leave both the registry and backup count unchanged.
        before := mustRead(t, filepath.Join(js, "plugins.js"))
        if err := run([]string{"install", root, payload}, os.Stdout); err != nil { t.Fatal(err) }
        after := mustRead(t, filepath.Join(js, "plugins.js"))
        if !bytes.Equal(before, after) { t.Fatal("repeated upgrade modified registry") }
        repeatBackups, err := filepath.Glob(pattern)
        if err != nil || len(repeatBackups) != len(backups) {
            t.Fatalf("repeated upgrade created new backups: %v (error: %v)", repeatBackups, err)
        }
    }
}

func mustRead(t *testing.T, path string) []byte {
    t.Helper()
    b, err := os.ReadFile(path)
    if err != nil { t.Fatal(err) }
    return b
}

func TestMalformedRegistryFallbackAndIdempotency(t *testing.T) {
    root,js,payload:=fixture(t,false)
    os.WriteFile(filepath.Join(js,"plugins.js"),[]byte("var $plugins = invalidJSValue;"),0o644)
    if err:=run([]string{"install",root,payload},os.Stdout);err!=nil{t.Fatal(err)}
    content,_:=os.ReadFile(filepath.Join(js,"main.js"))
    if !bytes.Contains(content,[]byte(newStart)){t.Fatal("managed fallback loader missing")}
    if err:=run([]string{"install",root,payload},os.Stdout);err!=nil{t.Fatal(err)}
    content,_=os.ReadFile(filepath.Join(js,"main.js"))
    if bytes.Count(content,[]byte(newStart))!=1{t.Fatal("duplicate loader")}
    if err:=run([]string{"remove",root},os.Stdout);err!=nil{t.Fatal(err)}
    content,_=os.ReadFile(filepath.Join(js,"main.js"))
    if bytes.Contains(content,[]byte(newStart)){t.Fatal("fallback loader not removed")}
}

func TestDoNotWriteOnMalformedPayload(t *testing.T) {
    root,js,payload:=fixture(t,false)
    os.WriteFile(payload,[]byte("not our plugin"),0o644)
    before,_:=os.ReadFile(filepath.Join(js,"plugins.js"))
    if err:=run([]string{"install",root,payload},os.Stdout);err==nil{t.Fatal("invalid payload unexpectedly accepted")}
    after,_:=os.ReadFile(filepath.Join(js,"plugins.js"))
    if !bytes.Equal(before,after){t.Fatal("modified on invalid payload")}
}

func TestOldMainLoaderEvenIfFileMissing(t *testing.T){
    root,js,payload:=fixture(t,false)
    main:=`// BEGIN CHEAT_MENU_INTEGRATED_LOADER
PluginManager.loadScript('Cheat_Menu.js');
// END CHEAT_MENU_INTEGRATED_LOADER
PluginManager.setup($plugins);
`
    os.WriteFile(filepath.Join(js,"main.js"),[]byte(main),0o644)
    if err:=run([]string{"install",root,payload},os.Stdout);err!=nil{t.Fatal(err)}
    data,_:=os.ReadFile(filepath.Join(js,"main.js"))
    if bytes.Contains(data,[]byte("Cheat_Menu.js")){t.Fatal("old JS loader still present")}
}
