# Changelog / История изменений

The entries below describe published functional releases. Documentation and CI-only changes made after a release do not alter its downloadable ZIP or Git tag.

Ниже перечислены изменения опубликованных функциональных версий. Последующие правки документации и тестов не меняют архив и тег уже выпущенной версии.

## v2.6.1 — 2026-10

- **RU:** Исправлен вероятный сбой `Window_ChoiceList` (`Cannot read properties of undefined (reading 'bitmap')`) при выходе из полного чит-меню во время мини-игр и игровых событий. Теперь `F7` открывает меню поверх текущей сцены карты без её пересоздания и приостанавливает игровую логику до выхода. Диалоговые окна и окна выбора остаются прежними.
- **EN:** Fixed a likely `Window_ChoiceList` bitmap crash when closing F7 during event choices or mini-games. The full menu now overlays the current map scene and pauses map event updates, preserving existing message and choice windows when the menu closes.

## v2.6.0 — 2026-10

- **RU:** Добавлен испанский язык (Español) во все разделы основного меню. Выбранный язык теперь одновременно применяется к основному меню и оригинальному быстрому оверлею по клавише `1`; русские и испанские подписи покрывают все 18 страниц, без изменения клавиш и чит-функций. Режим Auto распознаёт русский и испанский по настройкам игры или системы. Названия персонажей и объектов из базы игры не переводятся.
- **EN:** Added Spanish (Español) throughout the full menu. The chosen language now applies to both full and legacy quick menus; Russian and Spanish labels cover all 18 quick-menu pages without changing cheat actions or hotkeys. Auto detects Russian and Spanish from the game/system locale. Names supplied by the game database remain unchanged.

## v2.5.1 — 2026-10

- **RU:** Добавлена сортировка по категориям внутри каталогов предметов, оружия, брони и навыков. Группы обозначены неактивными заголовками, типы взяты из базы игры. Для карт, переключателей и переменных остались режимы по ID, названию и избранному: общих типов у них нет.
- **EN:** Added category sorting for item, weapon, armor and skill catalogs with non-interactive group headers. Types come from the game's database. Maps, switches and variables retain ID, name and favorites sorting because they have no native categories.

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
