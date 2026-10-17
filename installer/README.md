# Native installer (Windows and Linux)

The shared Go 1.22 installer modifies RPG Maker MV/MZ games. The downloaded release already includes compiled executables in `bin/`, so players do **not** need Go or Python. Keep the complete release folder together with the launchers.

## Development

From the repository root:

```sh
go -C installer test ./...
go -C installer build ./...
```

The installer locates `www/js/` or `js/`, updates `plugins.js` (with a managed `main.js` loader fallback for nonstandard registries), installs `SWF_CheatMenu.js`, and backs up changed files to `SWF_CheatMenu_Backup/`. Game saves are not modified.

Starting with **v2.3.1**, an existing `Cheat_Menu` entry with an empty description is disabled during migration while its settings are preserved. Recognized older integrated entries are removed. Other plugins are preserved and repeated installation is supported.

Only Windows and Linux installers are distributed in release **v2.6.2**.
