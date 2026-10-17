# SWF Cheat Menu — RPG Maker MV/MZ

**[Русский](#-русский) · [English](#-english)**  
**Version 2.4.0 · RPG Maker MV / MZ · Windows / Linux**

[![Release](https://img.shields.io/github/v/release/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu?label=Release)](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/releases/tag/v2.4.0) [![Platform](https://img.shields.io/badge/RPG%20Maker-MV%20%2F%20MZ-blue)](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu) [![Issues](https://img.shields.io/github/issues/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu)](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/issues)

 > **Latest release / Последняя версия:** [v2.4.0 — Download ZIP / Скачать ZIP](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/releases/download/v2.4.0/SWF_CheatMenu_MV_MZ_v2.4.0.zip).

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
| Поиск и прокрутка | Поиск по названию или ID прямо над списком; прокрутка длинных списков мышью |

В отличие от оригинального Cheat Menu, эта версия дополнена полноценным меню управления с удобным интерфейсом, расширенными настройками инвентаря и дополнительными возможностями в бою. Классическое быстрое меню по клавише `1` при этом сохранено. Во время боя телепортация и настройки перемещения недоступны, чтобы не нарушать игровую сцену.

### Управление

В основном меню поиск фильтрует список прямо во время ввода. Длинные списки можно прокручивать колесом мыши или боковым ползунком.

- `1` — оригинальное быстрое меню на карте или во время боя. **Оно остаётся на английском языке**, независимо от настройки языка основного меню.
- `F7` — основное меню на карте или в бою.
- **Язык:** пункт «Язык меню» в основном меню — `Auto`, `Русский`, `English`. Автоматический выбор использует языковую настройку игры, если она доступна, иначе язык системы. Выбор сохраняется для этой игры. Названия игровых предметов, навыков и карт остаются на языке самой игры.
- **«Меню управления» / «Control Menu»** — нерасходуемый ключевой предмет, открывающий основное меню через инвентарь, в том числе во время боя.

### Установка

1. Закройте игру и распакуйте [архив v2.4.0](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/releases/download/v2.4.0/SWF_CheatMenu_MV_MZ_v2.4.0.zip) **прямо в папку игры**.
2. Запустите `Install_Windows.cmd` (Windows) или `bash Install_Linux.sh` (Linux). Установщик **сам найдёт игру** и установит или обновит мод — выбирать папку не нужно.
3. Запустите игру. Меню открывается клавишей `F7` или через предмет «Меню управления», а быстрое меню — клавишей `1`.

**Если архив распакован в другую папку**, запустите установщик оттуда и выберите папку игры. Устанавливать Python или Go не требуется.

**Обновление:** повторно запустите установщик. Начиная с 2.3.1 установщик отключает конфликтующую старую запись `Cheat_Menu` без описания в `plugins.js`, сохраняя её параметры. Перед изменениями сохраняются резервные копии файлов в `SWF_CheatMenu_Backup/`. Для удаления используйте `Remove_Windows.cmd` или `bash Remove_Linux.sh`. Перед первым использованием рекомендуется сделать копию сохранений.

**Mac и Xenolauncher:** уже пропатченную на Windows или Linux игру можно перенести на Mac и попробовать запустить через [Xenolauncher](https://github.com/m5kro/Xenolauncher) — сторонний лаунчер для macOS. Если в нём включено `Enable Cheat Menu`, отключите эту опцию во избежание конфликта с модом. Совместимость зависит от игры и её плагинов.


### Ошибки и предложения

Если мод не работает в конкретной игре, [создайте Issue](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/issues/new/choose). Укажите название и версию игры, ОС, MV или MZ, установленную версию мода, шаги воспроизведения и текст ошибки. Скриншот и список других плагинов помогут быстрее разобраться.

### Ограничения

Совместимость зависит от дополнительных плагинов конкретной игры. Для зашифрованных сборок и изменённых систем боёв, предметов и интерфейса может понадобиться отдельная адаптация. Системные переключатели и телепортация могут нарушить сюжетные события. Проверяйте мод на копии сохранения. Автоматически проверяются сборка, установка, синтаксис и часть функций плагина. Совместимость со всеми играми MV/MZ **не гарантируется**.

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
| Search and scrolling | Instant name/ID filtering above the list; draggable scrollbar for long lists |

Unlike the original Cheat Menu, this edition adds a full control interface, expanded inventory settings, and additional battle features while keeping the classic quick overlay on `1`. Teleportation and movement controls are disabled during battle to avoid disrupting the game.

### Controls

The search field filters the current list as you type. Long lists support mouse-wheel scrolling and a draggable scrollbar.

- `1` — open the original quick overlay on the map or during battle. **This legacy menu remains in English**, regardless of your language setting for the main menu.
- `F7` — open the integrated main menu on the map or during battle.
- **Language:** choose `Auto`, `Русский`, or `English` under **Menu language** in the main menu. Auto uses the game's locale when available, otherwise the system language. The choice is saved per game. Item, skill, and map names remain in the game's own language.
- **Control Menu** (`Меню управления`) — a reusable key item that opens the full menu from the inventory, including during battle.

### Installation

1. Close the game and extract the [v2.4.0 ZIP](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/releases/download/v2.4.0/SWF_CheatMenu_MV_MZ_v2.4.0.zip) **directly into the game folder**.
2. Run `Install_Windows.cmd` (Windows) or `bash Install_Linux.sh` (Linux). The installer **detects the game automatically** and installs or updates the mod without asking you to choose a folder.
3. Launch the game. Open the full menu with `F7` or the Control Menu item; press `1` for the quick overlay.

**If you extracted the ZIP somewhere else**, run the installer there and select the game folder when prompted. Neither Python nor Go is required.

**Updating:** run the installer again. Starting in 2.3.1, the installer disables conflicting legacy `Cheat_Menu` entries with an empty description in `plugins.js`, preserving their settings. Modified files are backed up to `SWF_CheatMenu_Backup/`. To uninstall, use `Remove_Windows.cmd` or `bash Remove_Linux.sh`. Back up your save files before first use.

**Mac and Xenolauncher:** you can copy a game already patched on Windows or Linux to a Mac and try running it with [Xenolauncher](https://github.com/m5kro/Xenolauncher), a third-party macOS game launcher. If its `Enable Cheat Menu` option is on, turn it off to avoid conflicts with this mod. Compatibility depends on the game and its plugins.


### Bug reports and suggestions

If the mod fails in a specific game, [open an Issue](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/issues/new/choose) and include the game name/version, operating system, MV or MZ, mod version, steps to reproduce, and the exact error. Screenshots and a list of other plugins are helpful.

### Compatibility and caveats

Compatibility varies across game-specific plugins. Encrypted games or heavily modified battle, inventory, and UI systems may require custom fixes. Teleporting and changing progression switches can break scripted events; keep backups. Automated checks cover builds, installation, syntax, and selected plugin behavior. Compatibility with every MV/MZ game **is not guaranteed**.

---

### Project files / Файлы проекта

- [`SWF_CheatMenu.js`](SWF_CheatMenu.js) — combined plugin / объединённый плагин.
- [Releases](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/releases) — downloadable ZIP / архив для скачивания.
- [`CREDITS.md`](CREDITS.md) — authorship and redistribution notes / авторство и условия распространения.
- [`CHANGELOG.md`](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/blob/main/CHANGELOG.md) — release history / история версий.

### Credits / Благодарности

Based on the original Cheat Menu by [emerladCoder](https://github.com/emerladCoder/RPG-Maker-MV-Cheat-Menu-Plugin) and the MV/MZ adaptation by [NamelessMagician](https://github.com/NamelessMagician/RPG-Maker-MV-MZ-Cheat-Menu-Plugin). This integrated edition adds the item-driven control menu, expanded inventory management, and battle access.

Основано на оригинальном Cheat Menu от **emerladCoder** и его адаптации для MV/MZ от **NamelessMagician**. Эта сборка добавляет единое меню-предмет, дополнительные настройки инвентаря и использование во время боя.

**Licensing / Лицензирование:** see [CREDITS.md](CREDITS.md). Upstream redistribution terms have not been independently verified. Do not claim an open-source license for the entire derived code until those terms are confirmed. / См. [CREDITS.md](CREDITS.md). Условия распространения исходного кода требуют проверки; лицензия для всего производного проекта пока не назначена.