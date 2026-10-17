package main

import (
    "bytes"
    "encoding/json"
    "errors"
    "fmt"
    "io"
    "os"
    "path/filepath"
    "regexp"
    "strings"
    "time"
)

const (
    pluginName = "SWF_CheatMenu"
    pluginFile = pluginName + ".js"
    oldName = "Cheat_Menu"
    version = "2.3.1"
    oldStart = "// BEGIN CHEAT_MENU_INTEGRATED_LOADER"
    oldEnd = "// END CHEAT_MENU_INTEGRATED_LOADER"
    newStart = "// BEGIN SWF_CHEATMENU_LOADER"
    newEnd = "// END SWF_CHEATMENU_LOADER"
)

var (
    assignment = regexp.MustCompile(`(?:var|let|const)\s+\$plugins\s*=\s*`)
    oldBlock = regexp.MustCompile(`(?ms)^[ \t]*// BEGIN CHEAT_MENU_INTEGRATED_LOADER[^\n]*\n.*?^[ \t]*// END CHEAT_MENU_INTEGRATED_LOADER[^\n]*(?:\n|$)`)
    newBlock = regexp.MustCompile(`(?ms)^[ \t]*// BEGIN SWF_CHEATMENU_LOADER[^\n]*\n.*?^[ \t]*// END SWF_CHEATMENU_LOADER[^\n]*(?:\n|$)`)
    oldDirect = regexp.MustCompile(`(?m)^[ \t]*PluginManager\.loadScript\(\s*['"]Cheat_Menu\.js['"]\s*\)\s*;?[ \t]*(?:\n|$)`)
)

type change struct {
    path string
    data []byte
    remove bool
}

func main() {
    if err := run(os.Args[1:], os.Stdout); err != nil {
        fmt.Fprintln(os.Stderr, "ERROR:", err)
        os.Exit(1)
    }
}

func run(args []string, output io.Writer) error {
    if len(args) < 2 || (args[0] != "install" && args[0] != "remove") {
        return errors.New("usage: swf-setup install GAME_FOLDER PLUGIN_FILE | swf-setup remove GAME_FOLDER")
    }
    installing := args[0] == "install"
    if installing && len(args) != 3 {
        return errors.New("install requires the game folder and the SWF_CheatMenu.js source file")
    }
    root, js, err := gameScripts(args[1])
    if err != nil { return err }
    mainPath := filepath.Join(js, "main.js")
    registryPath := filepath.Join(js, "plugins.js")
    dest := filepath.Join(js, "plugins", pluginFile)
    mainOriginal, err := os.ReadFile(mainPath)
    if err != nil { return err }
    registryOriginal, err := os.ReadFile(registryPath)
    if err != nil { return err }
    oldIsOurs := recognizeOld(js, mainOriginal, registryOriginal)
    newRegistry, parsed, err := editRegistry(registryOriginal, installing, oldIsOurs)
    if err != nil { return err }
    newMain, err := editMain(mainOriginal, installing, parsed, oldIsOurs)
    if err != nil { return err }

    changes := []change{}
    if parsed && !bytes.Equal(registryOriginal, newRegistry) {
        changes = append(changes, change{registryPath, newRegistry, false})
    }
    if !bytes.Equal(mainOriginal, newMain) {
        changes = append(changes, change{mainPath, newMain, false})
    }
    if installing {
        src, err := os.ReadFile(args[2])
        if err != nil { return fmt.Errorf("cannot read plugin payload: %w", err) }
        if !bytes.Contains(src[:min(len(src), 512)], []byte("@plugindesc SWF Cheat Menu Integrated")) {
            return errors.New("unexpected plugin file; expected SWF_CheatMenu.js from this release")
        }
        existing, err := os.ReadFile(dest)
        if err != nil && !os.IsNotExist(err) { return err }
        if !bytes.Equal(existing, src) {
            changes = append(changes, change{dest, src, false})
        }
    } else if oldPlugin, err := os.ReadFile(dest); err == nil {
        if bytes.Contains(oldPlugin[:min(len(oldPlugin), 512)], []byte("@plugindesc SWF Cheat Menu Integrated")) {
            changes = append(changes, change{dest, nil, true})
        } else {
            fmt.Fprintln(output, "Existing SWF_CheatMenu.js was not recognized. Left it untouched.")
        }
    } else if !os.IsNotExist(err) { return err }

    if len(changes) == 0 {
        fmt.Fprintln(output, "Already up to date; no changes needed.")
        return nil
    }

    location, err := makeBackup(root, changes)
    if err != nil { return fmt.Errorf("could not create backups; no changes were made: %w", err) }

    applied := []change{}
    for _, item := range changes {
        if err := writeChange(item); err != nil {
            restoreBackup(root, location, applied)
            return fmt.Errorf("could not update %s: %w; attempted recovery from backup %s", item.path, err, location)
        }
        applied = append(applied, item)
    }
    if installing { fmt.Fprintln(output, "Installed SWF_CheatMenu.js") } else { fmt.Fprintln(output, "Removed SWF_CheatMenu.js") }
    fmt.Fprintln(output, "Game:", root)
    if location != "" { fmt.Fprintln(output, "Backup:", location) }
    if !parsed { fmt.Fprintln(output, "Nonstandard plugins.js: used the main.js loader.") }
    if installing && bytes.Contains(registryOriginal, []byte("Cheat_Menu")) {
        fmt.Fprintln(output, "Legacy Cheat_Menu registrations were removed or disabled when identifiable.")
    }
    return nil
}

func gameScripts(folder string) (string, string, error) {
    root, err := filepath.Abs(folder)
    if err != nil { return "", "", err }
    for _, candidate := range []string{filepath.Join(root, "www", "js"), filepath.Join(root, "js")} {
        if regular(filepath.Join(candidate, "main.js")) && regular(filepath.Join(candidate, "plugins.js")) {
            return root, candidate, nil
        }
    }
    return "", "", fmt.Errorf("not an RPG Maker MV/MZ game folder: %s (expected www/js/main.js and plugins.js, or js/)", root)
}
func regular(path string) bool {
    st, err := os.Stat(path)
    return err == nil && st.Mode().IsRegular()
}

func recognizeOld(js string, main, registry []byte) bool {
    if bytes.Contains(main, []byte(oldStart)) { return true }
    oldFile := filepath.Join(js, "plugins", "Cheat_Menu.js")
    if data, err := os.ReadFile(oldFile); err == nil && bytes.Contains(data[:min(len(data), 3000)], []byte("Cheat Menu Integrated")) {
        return true
    }
    records, ok := readRegistry(registry)
    if ok {
        for _, item := range records {
            var entry struct {
                Name string `json:"name"`
                Description string `json:"description"`
            }
            if json.Unmarshal(item, &entry) == nil && entry.Name == oldName && integrated(entry.Description) {
                return true
            }
        }
    }
    return false
}

func integrated(description string) bool {
    return strings.Contains(description, "Integrated Cheat Menu") ||
        strings.Contains(description, "Cheat Menu Integrated")
}

func readRegistry(source []byte) ([]json.RawMessage, bool) {
    source = bytes.TrimPrefix(source, []byte{0xef, 0xbb, 0xbf})
    loc := assignment.FindIndex(source)
    if loc == nil { return nil, false }
    cursor := loc[1]
    for cursor < len(source) && (source[cursor] == ' ' || source[cursor] == '\n' || source[cursor] == '\r' || source[cursor] == '\t') { cursor++ }
    decoder := json.NewDecoder(bytes.NewReader(source[cursor:]))
    var records []json.RawMessage
    if err := decoder.Decode(&records); err != nil || records == nil { return nil, false }
    return records, true
}

func editRegistry(source []byte, installing, ours bool) ([]byte, bool, error) {
    prefix := []byte{}
    stripped := source
    if bytes.HasPrefix(source, []byte{0xef, 0xbb, 0xbf}) {
        prefix = append(prefix, source[:3]...)
        stripped = source[3:]
    }
    loc := assignment.FindIndex(stripped)
    if loc == nil { return source, false, nil }
    start := loc[1]
    for start < len(stripped) && (stripped[start] == ' ' || stripped[start] == '\n' || stripped[start] == '\r' || stripped[start] == '\t') { start++ }
    decoder := json.NewDecoder(bytes.NewReader(stripped[start:]))
    var records []json.RawMessage
    if err := decoder.Decode(&records); err != nil || records == nil { return source, false, nil }
    end := start + int(decoder.InputOffset())
    updated := []json.RawMessage{}
    for _, record := range records {
        var entry struct {
            Name string `json:"name"`
            Description string `json:"description"`
        }
        if err := json.Unmarshal(record, &entry); err != nil {
            updated = append(updated, record)
            continue
        }
        if entry.Name == pluginName { continue }
        if installing && entry.Name == oldName {
            // Remove identified previous integrated installations.
            if ours || integrated(entry.Description) { continue }
            // Some older installs have a blank description. Disable, do not delete,
            // the record so that its configuration can be restored manually.
            if strings.TrimSpace(entry.Description) == "" {
                var fields map[string]json.RawMessage
                if err := json.Unmarshal(record, &fields); err == nil {
                    fields["status"] = json.RawMessage("false")
                    disabled, err := json.Marshal(fields)
                    if err != nil { return nil, false, err }
                    updated = append(updated, disabled)
                    continue
                }
            }
        }
        updated = append(updated, record)
    }
    if installing {
        updated = append(updated, json.RawMessage(`{"name":"SWF_CheatMenu","status":true,"description":"SWF Cheat Menu Integrated 2.3.1","parameters":{}}`))
    }
    output, err := json.MarshalIndent(updated, "", "    ")
    if err != nil { return nil, false, err }
    result := make([]byte, 0, len(source)+512)
    result = append(result, prefix...)
    result = append(result, stripped[:start]...)
    result = append(result, output...)
    result = append(result, stripped[end:]...)
    return result, true, nil
}

func editMain(source []byte, installing, registryHandled, ours bool) ([]byte, error) {
    output := oldBlock.ReplaceAll(source, nil)
    output = newBlock.ReplaceAll(output, nil)
    if ours { output = oldDirect.ReplaceAll(output, nil) }
    if installing && !registryHandled {
        marker := []byte("PluginManager.setup($plugins);")
        if !bytes.Contains(output, marker) {
            return nil, errors.New("nonstandard plugins.js and PluginManager.setup($plugins) not found in main.js")
        }
        lines := []string{
            newStart,
            "for (var swfI=$plugins.length-1; swfI>=0; --swfI) {",
            "  var swfP=$plugins[swfI];",
            "  if (swfP && swfP.name === 'SWF_CheatMenu') $plugins.splice(swfI,1);",
        }
        // For non-JSON registries, prevent an old anonymous Cheat_Menu from
        // registering alongside SWF_CheatMenu. Leave unrelated named plugins alone.
        lines = append(lines, "  if (swfP && swfP.name === 'Cheat_Menu' && (!swfP.description || /(?:Integrated Cheat Menu|Cheat Menu Integrated)/.test(swfP.description))) $plugins.splice(swfI,1);")
        lines = append(lines, "}",
            "$plugins.push({name:'SWF_CheatMenu',status:true,description:'SWF Cheat Menu Integrated 2.3.1',parameters:{}});",
            newEnd, "")
        output = bytes.Replace(output, marker, append([]byte(strings.Join(lines, "\n")), marker...), 1)
    }
    return output, nil
}

func makeBackup(root string, changes []change) (string, error) {
    existing := []string{}
    for _, c := range changes {
        if st, err := os.Stat(c.path); err == nil && st.Mode().IsRegular() {
            existing = append(existing, c.path)
        } else if err != nil && !os.IsNotExist(err) { return "", err }
    }
    if len(existing) == 0 { return "", nil }
    dst := filepath.Join(root, "SWF_CheatMenu_Backup", time.Now().Format("20060102-150405.000000000"))
    for _, path := range existing {
        relative, err := filepath.Rel(root, path)
        if err != nil || strings.HasPrefix(relative, "..") { return "", errors.New("unsafe backup path") }
        target := filepath.Join(dst, relative)
        if err := os.MkdirAll(filepath.Dir(target), 0o755); err != nil { return "", err }
        contents, err := os.ReadFile(path)
        if err != nil { return "", err }
        st, err := os.Stat(path)
        if err != nil { return "", err }
        if err := os.WriteFile(target, contents, st.Mode().Perm()); err != nil { return "", err }
    }
    return dst, nil
}

func writeChange(c change) error {
    if c.remove { return os.Remove(c.path) }
    if err := os.MkdirAll(filepath.Dir(c.path), 0o755); err != nil { return err }
    mode := os.FileMode(0o644)
    if stat, err := os.Stat(c.path); err == nil { mode = stat.Mode().Perm() }
    tmp, err := os.CreateTemp(filepath.Dir(c.path), ".swf-cheat-menu-*")
    if err != nil { return err }
    defer os.Remove(tmp.Name())
    if _, err = tmp.Write(c.data); err != nil { tmp.Close(); return err }
    if err = tmp.Chmod(mode); err != nil { tmp.Close(); return err }
    if err = tmp.Close(); err != nil { return err }
    return os.Rename(tmp.Name(), c.path)
}

func restoreBackup(root, location string, applied []change) {
    for i := len(applied)-1; i >= 0; i-- {
        c := applied[i]
        if location != "" {
            rel, err := filepath.Rel(root, c.path)
            if err == nil && !strings.HasPrefix(rel, "..") {
                if original, err := os.ReadFile(filepath.Join(location, rel)); err == nil {
                    _ = writeChange(change{c.path, original, false})
                    continue
                }
            }
        }
        _ = os.Remove(c.path)
    }
}
