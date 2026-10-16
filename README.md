# SWF Cheat Menu — RPG Maker MV/MZ

**[Русский](#-русский) · [English](#-english)**  
**Version 2.2.0 · RPG Maker MV / MZ · Windows / macOS / Linux**

[![Release](https://img.shields.io/github/v/release/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu?label=Release)](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/releases/tag/v2.2.0) [![Platform](https://img.shields.io/badge/RPG%20Maker-MV%20%2F%20MZ-blue)](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu) [![Issues](https://img.shields.io/github/issues/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu)](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/issues)

 > **Latest release / Последняя версия:** [v2.2.0 — Download ZIP / Скачать ZIP](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/releases/download/v2.2.0/SWF_CheatMenu_MV_MZ_v2.2.0.zip).

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

- `1` — быстрый оверлей на карте или во время боя.
- `F7` — основное меню на карте или в бою.
- **«Меню управления»** — ключевой предмет для открытия меню, включая боевой инвентарь; не расходуется и не должен отнимать ход.

### Установка

1. **Закройте игру и создайте резервную копию сохранений.**
2. Скачайте и распакуйте [архив версии 2.2.0](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/releases/download/v2.2.0/SWF_CheatMenu_MV_MZ_v2.2.0.zip) в любую папку.
3. В Windows запустите `Install_Windows.cmd` и выберите папку игры в появившемся окне. В macOS — `Install_macOS.command`, в Linux — `bash Install_Linux.sh` (при запуске из другой папки передайте путь к игре). **Для установщиков требуется Python 3.**
4. Убедитесь, что создано **одно** подключение `SWF_CheatMenu.js` в `js/plugins` или `www/js/plugins`.
5. Запустите игру и проверьте меню на отдельном сохранении.

**Xenolauncher:** отключите его встроенное `Enable Cheat Menu`. Плагин использует имя `SWF_CheatMenu.js`; установщик переносит распознаваемые подключения прежней объединённой версии и сохраняет резервные копии изменённых файлов.

**Удаление:** закройте игру и запустите `Remove_Windows.cmd`, `Remove_macOS.command` или `bash Remove_Linux.sh`. Резервные копии установщика находятся в `SWF_CheatMenu_Backup/`.

### Ошибки и предложения

Если мод не работает в конкретной игре, [создайте Issue](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/issues/new/choose). Укажите название и версию игры, MV или MZ, установленную версию мода, шаги воспроизведения и текст ошибки. Скриншот и список других плагинов помогут быстрее разобраться.

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

- `1` — open the legacy quick overlay on the map or during battle.
- `F7` — open the integrated main menu on the map or during battle.
- **Control Menu** (`Меню управления`) — a non-consumable key item usable from the inventory, including in battle, without intentionally spending a turn.

### Installation

1. **Close the game and back up your save files.**
2. Download and extract the [v2.2.0 release ZIP](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/releases/download/v2.2.0/SWF_CheatMenu_MV_MZ_v2.2.0.zip) to any folder.
3. On Windows, run `Install_Windows.cmd` and select the game folder in the dialog. On macOS, run `Install_macOS.command` and choose the game folder; on Linux, run `bash Install_Linux.sh` (pass the game folder path if extracted elsewhere). **Python 3 is required by the installers.**
4. Confirm that only one `SWF_CheatMenu.js` is enabled under `js/plugins` or `www/js/plugins`.
5. Launch the game and test with a separate save slot.

**Xenolauncher:** keep its built-in `Enable Cheat Menu` disabled. The plugin uses the separate filename `SWF_CheatMenu.js`; the installer migrates recognized previous integrated-menu registrations and backs up any overwritten files.

**Uninstall:** close the game and run `Remove_Windows.cmd`, `Remove_macOS.command` or `bash Remove_Linux.sh`. Backups are stored in `SWF_CheatMenu_Backup/`.

### Bug reports and suggestions

If the mod fails in a specific game, [open an Issue](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/issues/new/choose) and include the game name/version, MV or MZ, mod version, steps to reproduce, and the exact error. Screenshots and a list of other plugins are helpful.

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