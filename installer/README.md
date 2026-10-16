# Native installer (no Python dependency)

This directory contains the shared Go 1.22 installation engine used by Windows, macOS and Linux. The release archive contains compiled binaries for supported architectures; end users do not need Go.

The installer intentionally keeps the RPG Maker MV/MZ game modifications from v2.2.0: updates plugins.js (or a guarded main.js loader for nonstandard registries), recognizes the previous Integrated Cheat Menu install, backs up changed files, preserves unrelated plugins and never modifies saves.

Develop/test: go test ./installer/...
