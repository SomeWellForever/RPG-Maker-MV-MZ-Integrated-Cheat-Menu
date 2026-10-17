# Changelog / История изменений

The entries below describe published functional releases. Documentation and CI-only changes made after a release do not alter its downloadable ZIP or Git tag.

Ниже перечислены изменения опубликованных функциональных версий. Последующие правки документации и тестов не меняют архив и тег уже выпущенной версии.

## v2.5.0 — 2026-10

- **RU:** Главное меню переработано в сетку 2×3 с группировкой старых функций по разделам. Добавлены избранное внутри всех каталогов и отдельный пункт «Избранное», безопасное редактирование ★, фильтр «только избранное» и сортировка по ID, названию или избранному. Звёздочки и порядок сортировки сохраняются вместе с текущим файлом сохранения игры. Быстрое меню по клавише `1` и нативный ползунок 2.4.1 не менялись.
- **EN:** Reorganized the main menu into a two-column, six-tile native layout. Added shared per-save Favorites inside all catalogs and a dedicated Favorites section, safe ★ editing, favorites-only filtering, and sorting by ID, name, or favorites first. The legacy overlay on `1` and the 2.4.1 native scrollbar remain unchanged.

## v2.4.1 — 2026-10

- **RU:** Упрощены поиск и прокрутка: поиск по названию/ID снова вызывается первым пунктом списка, а ползунок создаётся средствами RPG Maker MV/MZ без постоянного HTML-слоя и дополнительных глобальных обработчиков ввода. Добавлен отдельный архив только с JavaScript для обновления ранее установленных версий. Предупреждение антивируса о ZIP v2.4.0 не подтверждено и требует отдельной проверки.
- **EN:** Simplified list search and scrolling: name/ID search uses the first catalog command and the scrollbar is rendered natively by RPG Maker MV/MZ without a persistent browser overlay or extra global input handlers. Added a plugin-only JavaScript update package. The v2.4.0 archive's antivirus detection remains unverified and requires separate investigation.

## v2.4.0 — 2026-10

- **RU:** В основное меню добавлены поиск по названию или ID прямо над списком и перетаскиваемая полоса прокрутки. Доступно на карте и во время боя. Исходное быстрое меню по клавише `1` не менялось.
- **EN:** Added live name/ID search and a draggable scrollbar to the full control menu, both on the map and during battle. The original quick overlay on `1` is unchanged.

## v2.3.1 — 2026-10

- **RU:** Исправлена миграция `plugins.js`: старый `Cheat_Menu` без описания отключается, сохраняя настройки; добавлена защита от повторной загрузки основного скрипта и конфликта клавиши `1`.
- **EN:** Fixed `plugins.js` migration for older `Cheat_Menu` entries without descriptions, preserving settings. Added a single-load guard to prevent duplicate quick-menu hotkeys.

## v2.3.0 — 2026-10

- **RU:** Добавлены русский/английский интерфейс основного меню и автономные установщики Windows/Linux на Go. Быстрое меню по клавише `1` осталось английским.
- **EN:** Added Russian/English localization for the full menu and standalone Go-based Windows/Linux installers. The legacy quick overlay opened by `1` remains in English.

## v2.2.0 — historical / архивная версия

- **RU:** Предыдущая редакция объединённого меню с ранним механизмом установки. Сохранена как исторический релиз.
- **EN:** Previous integrated-menu edition with its earlier installation method. Retained as a historical release.

For the current release and download instructions, see [README.md](README.md).
Актуальная версия и инструкция по установке находятся в [README.md](README.md).
