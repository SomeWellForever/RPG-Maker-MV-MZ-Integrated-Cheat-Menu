# SWF Cheat Menu — RPG Maker MV/MZ

**[Русский](#-русский) · [English](#-english)**  
**Version 2.3.0 · RPG Maker MV / MZ · Windows / Linux**

[![Release](https://img.shields.io/github/v/release/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu?label=Release)](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/releases/tag/v2.3.0) [![Platform](https://img.shields.io/badge/RPG%20Maker-MV%20%2F%20MZ-blue)](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu) [![Issues](https://img.shields.io/github/issues/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu)](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/issues)

 > **Latest release / Последняя версия:** [v2.3.0 — Download ZIP / Скачать ZIP](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/releases/download/v2.3.0/SWF_CheatMenu_MV_MZ_v2.3.0.zip).

> An integrated cheat menu for single-player games made with RPG Maker MV and MZ. One JavaScript plugin, one in-game key item, and a quick overlay accessible in and out of battle.
>
> Объединённое чит-меню для одиночных игр на RPG Maker MV и MZ. Один JavaScript-плагин, один игровой предмет и быстрый оверлей, доступный в том числе во время боя.

---

## 🇷🇺 Русский

### Возможности

| Раздел | Возможности |
| --- | --- |
| Персонажи | Уровни, опыт, HP / MP / TP, характеристики, навыки, состояния, бессмертие |
| Инвентарь | Выдача предметов, оружия и брони; лимиты по выбору — стандартный, 99, 999 или 9999 |
| Карта | Телепортация, возврат, три сохранённые позиции, проход через стены, скорость передвижения |
| Группа | Восстановление HP / MP / TP, снятие состояний |
| Прогресс | Золото, игровые переменные и переключатели |
| Бой | Изменение HP противников, мгновенная победа |
| Быстрый оверлей | Оригинальные 18 страниц Cheat Menu, доступные клавишей `1` |

Встроенное меню объединяет функции без отдельной вкладки с дублирующими командами. В бою недоступны телепортация и изменения перемещения, которые могут нарушить игровую сцену.

### Управление

- `1` — оригинальное быстрое меню на карте или во время боя. **Оно остаётся на английском языке**, независимо от настройки языка основного меню.
- `F7` — основное меню на карте или в бою.
- **Язык:** пункт «Язык меню» в основном меню — `Auto`, `Русский`, `English`. Автоматический выбор использует языковую настройку игры, если она доступна, иначе язык системы. Выбор сохраняется для этой игры. Названия игровых предметов, навыков и карт остаются на языке самой игры.
- **«Меню управления» / «Control Menu»** — ключевой предмет для открытия меню, включая боевой инвентарь; не расходуется и не должен отнимать ход.

### Установка

1. **Закройте игру и создайте резервную копию сохранений.**
2. Скачайте и **полностью распакуйте** [архив версии 2.3.0](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/releases/download/v2.3.0/SWF_CheatMenu_MV_MZ_v2.3.0.zip). Не удаляйте и не переносите папку `bin` отдельно: в ней находятся готовые установочные программы.
3. В Windows запустите `Install_Windows.cmd`; в Linux — `bash Install_Linux.sh`. Выберите папку игры: в Windows откроется окно выбора папки, в Linux — Zenity/KDialog (если доступны) или запрос пути в терминале. Можно также передать путь к игре аргументом. **Python и Go устанавливать не нужно:** установщики используют готовые программы из папки `bin`.
4. Выбирайте **корневую папку игры**, а не подпапку `js`: в MV обычно есть `www/` (часто рядом с `Game.exe`), в MZ — `js/`. Установщик помещает файл в `www/js/plugins/` (MV) или `js/plugins/` (MZ) и создаёт **одну** запись `SWF_CheatMenu` в соответствующем `plugins.js`.
5. Запустите игру и проверьте меню на отдельном сохранении.

**macOS не поддерживается в v2.3.0:** установщик для Mac исключён из-за нерешённых проблем с запуском.

**Обновление поверх старой версии:** просто повторно запустите установщик. Он распознаёт предыдущие установки и обновляет подключение без дубликатов. Изменяемые существующие файлы заранее копируются в `SWF_CheatMenu_Backup/` в папке игры.

**Необязательное примечание для пользователей Xenolauncher.** [Xenolauncher](https://github.com/m5kro/Xenolauncher) — **отдельный сторонний лаунчер для macOS**, который может запускать игры RPG Maker. **Только если вы уже им пользуетесь** и включили его опцию `Enable Cheat Menu`, отключите её: два чит-меню могут конфликтовать. **Xenolauncher не требуется для установки этого мода.** Примечание не означает поддержку macOS в текущем релизе.

**Удаление:** закройте игру и запустите `Remove_Windows.cmd` или `bash Remove_Linux.sh`. Удаление не требует исходного файла плагина рядом с установщиком. Сохранения игры не удаляются.

### Ошибки и предложения

Если мод не работает в конкретной игре, [создайте Issue](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/issues/new/choose). Укажите название и версию игры, ОС, MV или MZ, установленную версию мода, шаги воспроизведения и текст ошибки. Скриншот и список других плагинов помогут быстрее разобраться.

### Ограничения

Совместимость зависит от дополнительных плагинов конкретной игры. Для зашифрованных сборок и изменённых систем боёв, предметов и интерфейса может понадобиться отдельная адаптация. Системные переключатели и телепортация могут нарушить сюжетные события. Проверяйте мод на копии сохранения. Проверки выполнялись на тестовых моделях MV/MZ; универсальная работоспособность во всех играх **не гарантируется**.

---

## 🇬🇧 English

### Features

| Category | Features |
| --- | --- |
| Characters | Levels, EXP, HP / MP / TP, attributes, skills, states, god mode |
| Inventory | Add items, weapons, and armor; selectable stack limits: default, 99, 999, or 9999 |
| World | Teleportation, return, three saved positions, no-clip, movement speed |
| Party | Recover HP / MP / TP and clear states |
| Progress | Gold, game variables, and switches |
| Battle | Modify enemy HP and instantly defeat enemies |
| Quick overlay | The legacy Cheat Menu with 18 pages, opened with `1` |

The integrated menu combines features without a duplicate "extra cheats" section. Map movement and teleport controls are unavailable during battle to reduce the risk of interrupting combat.

### Controls

- `1` — open the original quick overlay on the map or during battle. **This legacy menu remains in English**, regardless of your language setting for the main menu.
- `F7` — open the integrated main menu on the map or during battle.
- **Language:** choose `Auto`, `Русский`, or `English` under **Menu language** in the main menu. Auto uses the game's locale when available, otherwise the system language. The choice is saved per game. Item, skill, and map names remain in the game's own language.
- **Control Menu** (`Меню управления`) — a non-consumable key item usable from the inventory, including in battle, without intentionally spending a turn.

### Installation

1. **Close the game and back up your save files.**
2. Download and **fully extract** the [v2.3.0 release ZIP](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/releases/download/v2.3.0/SWF_CheatMenu_MV_MZ_v2.3.0.zip). Keep the `bin` folder beside the installers; it contains the precompiled executables.
3. Run `Install_Windows.cmd` on Windows or `bash Install_Linux.sh` on Linux. Choose the game folder: Windows opens a folder chooser, while Linux uses Zenity/KDialog when available or asks for a folder path in the terminal. You can also supply the game folder as an argument. **Python and Go are not required:** the installers use precompiled programs from the `bin` folder.
4. Select the **game root folder**, not the `js` subfolder: MV usually contains `www/` (often beside `Game.exe`), while MZ contains `js/`. The installer copies the file to `www/js/plugins/` (MV) or `js/plugins/` (MZ) and adds **one** `SWF_CheatMenu` entry to the corresponding `plugins.js`.
5. Launch the game and test with a separate save slot.

**macOS is not supported in v2.3.0:** the installer was removed because of unresolved launch issues.

**Updating an existing installation:** simply run the installer again. It recognizes previous integrated-menu installations and avoids duplicate registrations. Changed existing game files are backed up in `SWF_CheatMenu_Backup/` inside the game directory.

**Optional note for Xenolauncher users only.** [Xenolauncher](https://github.com/m5kro/Xenolauncher) is a **separate third-party macOS game launcher** that can launch RPG Maker games. **Only if you already use it** and have its `Enable Cheat Menu` option enabled, turn that option off to avoid conflicting cheat menus. **Xenolauncher is not required to install this mod.** This note does not imply support for macOS in the current release.

**Uninstall:** close the game and run `Remove_Windows.cmd` or `bash Remove_Linux.sh`. The original plugin file is not required next to the removal launcher. Game saves are not deleted.

### Bug reports and suggestions

If the mod fails in a specific game, [open an Issue](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/issues/new/choose) and include the game name/version, operating system, MV or MZ, mod version, steps to reproduce, and the exact error. Screenshots and a list of other plugins are helpful.

### Compatibility and caveats

Compatibility varies across game-specific plugins. Encrypted games or heavily modified battle, inventory, and UI systems may require custom fixes. Teleporting and changing progression switches can break scripted events; keep backups. Syntax and test-scene checks were performed for MV/MZ, but support for every game **is not guaranteed**.

---

### Project files / Файлы проекта

- [`SWF_CheatMenu.js`](SWF_CheatMenu.js) — combined plugin / объединённый плагин.
- [Releases](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/releases) — downloadable ZIP / архив для скачивания.
- [`CREDITS.md`](CREDITS.md) — authorship and redistribution notes / авторство и условия распространения.

### Credits / Благодарности

Based on the original Cheat Menu by [emerladCoder](https://github.com/emerladCoder/RPG-Maker-MV-Cheat-Menu-Plugin) and the MV/MZ adaptation by [NamelessMagician](https://github.com/NamelessMagician/RPG-Maker-MV-MZ-Cheat-Menu-Plugin). This integrated edition adds the item-driven control menu, expanded inventory management, and battle access.

Основано на оригинальном Cheat Menu от **emerladCoder** и его адаптации для MV/MZ от **NamelessMagician**. Эта сборка добавляет единое меню-предмет, дополнительные настройки инвентаря и использование во время боя.

**Licensing / Лицензирование:** see [CREDITS.md](CREDITS.md). Upstream redistribution terms have not been independently verified. Do not claim an open-source license for the entire derived code until those terms are confirmed. / См. [CREDITS.md](CREDITS.md). Условия распространения исходного кода требуют проверки; лицензия для всего производного проекта пока не назначена.