# Installer / Установщик

The release includes ready-to-run installers for **Windows and Linux**. Players do not need Go or Python.

From the game folder, run `Install_Windows.cmd` or `bash Install_Linux.sh`. The installer finds `www/js/` or `js/`, installs `SWF_CheatMenu.js` and updates the loader. Changed files are backed up to `SWF_CheatMenu_Backup/`; saves are untouched. Reinstall to update or use the corresponding `Remove_*` script to uninstall.

Older conflicting `Cheat_Menu` entries are handled during migration; unrelated plugins are preserved.

## Development

Go 1.22+ is needed **only to build or test** the installer:

```sh
go -C installer test ./...
go -C installer build ./...
```

Latest packaged version: **v2.8.0**.
