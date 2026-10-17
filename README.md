# SWF Cheat Menu — RPG Maker MV/MZ

**[Русский](#-русский) · [English](#-english) · [Español](#-español)**  
**Version 2.7.0 · RPG Maker MV / MZ · Windows / Linux**

[![Release](https://img.shields.io/github/v/release/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu?label=Release)](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/releases/tag/v2.7.0) [![Platform](https://img.shields.io/badge/RPG%20Maker-MV%20%2F%20MZ-blue)](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu) [![Issues](https://img.shields.io/github/issues/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu)](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/issues)

 > **Latest release / Последняя версия:** [v2.7.0 — Download ZIP / Скачать ZIP](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/releases/download/v2.7.0/SWF_CheatMenu_MV_MZ_v2.7.0.zip).

> An integrated cheat menu for single-player games made with RPG Maker MV and MZ. One JavaScript plugin, one in-game key item, and a quick overlay accessible in and out of battle.
>
> Объединённое чит-меню для одиночных игр на RPG Maker MV и MZ. Один JavaScript-плагин, один игровой предмет и быстрый оверлей, доступный в том числе во время боя.

---

## 🇷🇺 Русский

### Возможности

| Раздел | Возможности |
| --- | --- |
| Персонажи | Уровни, опыт, HP / MP / TP, характеристики, навыки, состояния, бессмертие |
| Инвентарь | Выдача предметов, оружия и брони, лимиты 99/999/9999; пополнение уже имеющихся обычных предметов |
| Карта | Телепортация, возврат, три сохранённые позиции, проход через стены, скорость передвижения |
| Группа | Восстановление HP / MP / TP, снятие состояний |
| Прогресс | Золото, игровые переменные и переключатели |
| Бой | Изменение HP противников, мгновенная победа |
| Быстрый оверлей | Оригинальные 18 страниц Cheat Menu, доступные клавишей `1` |
| Поиск и прокрутка | Поиск по названию или ID через первый пункт каталога; полоса прокрутки средствами RPG Maker |
| Языки | Русский, английский и испанский для основного и быстрого меню; автоматическое определение |
| Главное меню | Шесть крупных плиток в сетке 2×3; во время боя раздел «Мир» заменяется разделом «Бой» |
| Избранное и сортировка | Звёздочки в каталогах и общий раздел «Избранное»; сортировка по ID, названию, категориям или избранному |

В отличие от оригинального Cheat Menu, эта версия дополнена полноценным меню управления с удобным интерфейсом, расширенными настройками инвентаря и дополнительными возможностями в бою. Классическое быстрое меню по клавише `1` при этом сохранено. Во время боя телепортация и настройки перемещения недоступны, чтобы не нарушать игровую сцену. При вызове через `F7` меню открывается поверх сцены карты, не пересоздавая окна активных событий и мини-игр; выполнение карты временно приостанавливается.

### Управление

Для поиска выберите первый пункт «Поиск» в списке предметов, навыков, карт, переключателей или переменных и введите название либо ID. Длинные списки можно прокручивать колёсиком мыши или боковым ползунком.

**Расширенный поиск по значению:** в списке переменных обычный запрос продолжает искать по названию или ID. Для поиска по текущему значению используйте `=125` (точно 125), `>100`, `<50`, `>=100`, `<=50`, `=true`, `=false` или `=quest_started` (точное текстовое значение без учёта регистра). Числовые сравнения работают только с числовыми переменными, без преобразования текстовых значений в числа. В списке переключателей запросы `ON` / `OFF` или `=true` / `=false` / `=1` / `=0` ищут по текущему состоянию. **Без оператора** `125` и `1` по-прежнему ищут только по названию и ID. Поиск ничего не меняет в игре, а результаты обновляются после изменения значений. Показываются записи с названиями из базы игры.

**Пополнение уже имеющихся предметов:** откройте `F7 → Инвентарь → Пополнить имеющиеся обычные предметы`. Одно нажатие увеличивает количество уже полученных обычных предметов до их индивидуального максимума (в том числе с учётом выбранного лимита 99, 999 или 9999). Новых видов предметов функция не выдаёт. Оружие, броня, ключевые и скрытые предметы, уникальные экземпляры и предметы с запретом складывания не затрагиваются. Используется обычная функция выдачи игры, а при нестандартном инвентаре отдельные позиции могут быть пропущены. **Owned-item refill** работает только с предметами, которые уже есть в инвентаре, и не уменьшает их количество. При изменении лимитов сначала настройте лимит, затем нажмите пополнение. Перед массовым изменением рекомендуется сохранить игру в другом слоте.

Главное меню состоит из шести плиток: «Персонажи и отряд», «Инвентарь», «Мир и перемещение» (либо «Бой» во время сражения), «Прогресс игры», «Избранное» и «Настройки». Внутри разделов используются обычные списки. Избранное и сортировка доступны для предметов, оружия, брони, карт, навыков, переключателей и переменных. Выберите «Редактирование ★: ВКЛ», чтобы добавлять записи в избранное нажатием; повторное нажатие снимает звёздочку, не выполняя игрового действия. Команда «Только избранное» фильтрует текущий список; одноимённый раздел главного меню собирает отмеченные записи по категориям. Сортировка: по ID, названию, категориям или с избранным сверху. Режим «по категориям» группирует предметы (обычные, ключевые и скрытые), оружие, броню и навыки по типам из базы игры, отображая названия групп. Для карт, переменных и переключателей категории не предусмотрены. Избранное и параметры сортировки хранятся в текущем сохранении игры; изменение звёздочек попадёт в файл после обычного сохранения игры.

- `1` — оригинальное быстрое меню на карте или во время боя. **Его язык меняется вместе с основным меню** (русский, английский или испанский).
- `F7` — основное меню на карте или в бою.
- **Язык:** `Auto`, `Русский`, `English`, `Español` в разделе «Настройки» → «Язык меню». **Основное и быстрое меню переключаются одновременно**. `Auto` использует язык игры (если он указан) или системы и распознаёт русский, английский и испанский. Выбор сохраняется для этой игры. Названия персонажей, предметов, навыков и карт из базы игры не переводятся.
- **«Меню управления» / «Control Menu»** — нерасходуемый ключевой предмет, открывающий основное меню через инвентарь, в том числе во время боя.

### Установка

1. Закройте игру и распакуйте [архив v2.7.0](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/releases/download/v2.7.0/SWF_CheatMenu_MV_MZ_v2.7.0.zip) **прямо в папку игры**.
2. Запустите `Install_Windows.cmd` (Windows) или `bash Install_Linux.sh` (Linux). Установщик **сам найдёт игру** и установит или обновит мод — выбирать папку не нужно.
3. Запустите игру. Меню открывается клавишей `F7` или через предмет «Меню управления», а быстрое меню — клавишей `1`.

**[Дополнительный архив без установщика](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/releases/download/v2.7.0/SWF_CheatMenu_plugin_only_v2.7.0.zip):** для уже установленного SWF Cheat Menu доступен ZIP только с `SWF_CheatMenu.js`. Закройте игру, сохраните копию старого `www/js/plugins/SWF_CheatMenu.js` (или `js/plugins/SWF_CheatMenu.js`) и замените его файлом из архива. Такой архив не предназначен для первоначальной установки. Если защитник Windows обнаруживает угрозу, не отключайте защиту и не добавляйте файлы в исключения: отправьте обнаружение на проверку Microsoft.

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
| Inventory | Add items, weapons, and armor; configurable stack limits and one-click owned-item refill |
| World | Teleportation, return, three saved positions, no-clip, movement speed |
| Party | Recover HP / MP / TP and clear states |
| Progress | Gold, game variables, and switches |
| Battle | Modify enemy HP and instantly defeat enemies |
| Quick overlay | The legacy Cheat Menu with 18 pages, opened with `1` |
| Search and scrolling | Name/ID search from the first catalog entry; draggable RPG Maker scrollbar for long lists |
| Languages | Russian, English and Spanish for both the full menu (`F7`) and quick overlay (`1`); automatic detection |
| Main menu | Large two-column grid (2×3) with six sections; Battle replaces World while fighting |
| Favorites and sorting | Star entries and a dedicated Favorites section; sort by ID, name, category, or favorites first |

Unlike the original Cheat Menu, this edition adds a full control interface, expanded inventory settings, and additional battle features while keeping the classic quick overlay on `1`. Teleportation and movement controls are disabled during battle to avoid disrupting the game. F7 opens the control UI on top of the current map scene without recreating active message/choice windows; map events and mini-game scripts are paused until it closes.

### Controls

Choose the first Search entry in an item, skill, map, switch or variable catalog and enter a name or ID. Long lists support mouse-wheel scrolling and a draggable scrollbar.

**Extended search by value:** in Variables, ordinary input still matches names or IDs. Use `=125` (exact numeric value), `>100`, `<50`, `>=100`, `<=50`, `=true`, `=false`, or `=quest_started` (exact case-insensitive text match). Numeric comparisons apply only to actual numeric variables, not numeric-looking strings. In Switches, use `ON` / `OFF` or `=true` / `=false` / `=1` / `=0` to filter by current state. **Without an operator**, `125` and `1` still match only names/IDs. Searching never changes game values; results refresh after a value changes. Only named database entries are listed.

**One-click owned-item refill:** choose `F7 → Inventory → Refill owned normal items`. It fills only normal items already present in your inventory up to each item's effective maximum (including your selected 99/999/9999 stack limit). It does not create previously missing item types or touch weapons, armor, key/hidden items, unique instances, or no-stack items. It uses the game's normal inventory function; custom inventory extensions may cause individual items to be skipped. Existing counts are never reduced. Set your stack limit first and save to a separate slot before a bulk inventory modification.

The six-section main menu uses a two-column grid: Characters & party, Inventory, World & travel (replaced by Battle during combat), Game progress, Favorites, and Settings. Submenus remain vertical lists. Favorites and sorting work for items, weapons, armor, maps, skills, switches, and variables. Choose **Edit ★: ON** to mark or unmark entries without executing their cheat actions. **Favorites only** filters the current catalog, while the Favorites main-menu section groups starred records by type. Sorting offers ID, name, by category, or favorites first. Category mode groups items (normal, key and hidden), weapons, armor and skills according to type IDs and names from the game's database. Maps, switches and variables have no built-in category taxonomy. Stars and sort preferences belong to the current game save and are persisted the next time you save in-game.

- `1` — open the original quick overlay on the map or during battle. **It changes language together with the main menu** (Russian, English, or Spanish).
- `F7` — open the integrated main menu on the map or during battle.
- **Language:** choose `Auto`, `Русский`, `English`, or `Español` under **Settings → Menu language**. The main and quick menu use the same language, updated together immediately. Auto uses the game's locale when available, otherwise the system language, and recognizes Russian, English, and Spanish. The preference is saved per game. Game-provided actor, item, skill, and map names stay in their original language.
- **Control Menu** (`Меню управления`) — a reusable key item that opens the full menu from the inventory, including during battle.

### Installation

1. Close the game and extract the [v2.7.0 ZIP](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/releases/download/v2.7.0/SWF_CheatMenu_MV_MZ_v2.7.0.zip) **directly into the game folder**.
2. Run `Install_Windows.cmd` (Windows) or `bash Install_Linux.sh` (Linux). The installer **detects the game automatically** and installs or updates the mod without asking you to choose a folder.
3. Launch the game. Open the full menu with `F7` or the Control Menu item; press `1` for the quick overlay.

**[Plugin-only alternative](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/releases/download/v2.7.0/SWF_CheatMenu_plugin_only_v2.7.0.zip):** users with an existing SWF Cheat Menu installation may use the ZIP containing only `SWF_CheatMenu.js`. Close the game, back up the existing `www/js/plugins/SWF_CheatMenu.js` (or `js/plugins/SWF_CheatMenu.js`) and replace it. This package is not intended for first-time installation. If Windows Defender detects a threat, do not disable protection or allowlist the file; submit the detection to Microsoft for review.

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
---

## 🇪🇸 Español

**SWF Cheat Menu** funciona con RPG Maker MV/MZ en Windows y Linux. Incluye un menú completo (`F7` o el objeto `Menú de control`) y un menú rápido (`1`) que también funciona durante el combate.

**Idioma:** ve a **Ajustes → Idioma del menú** y selecciona `Español`, `Русский`, `English` o `Auto`. Ambos menús cambian a la vez. El modo automático detecta el idioma del juego cuando está disponible o utiliza el idioma del sistema. Los nombres de personajes, objetos, mapas y habilidades definidos por el juego no se traducen.

**Instalación:** cierra el juego, extrae [la versión 2.7.0](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/releases/download/v2.7.0/SWF_CheatMenu_MV_MZ_v2.7.0.zip) directamente en la carpeta del juego y ejecuta `Install_Windows.cmd` (Windows) o `bash Install_Linux.sh` (Linux). El instalador detectará el juego automáticamente. Si ya instalaste el mod, puedes [actualizar solo el plugin JavaScript](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/releases/download/v2.7.0/SWF_CheatMenu_plugin_only_v2.7.0.zip) siguiendo las instrucciones incluidas. Haz una copia de seguridad de tus partidas antes de modificar el juego.

**Rellenar objetos ya obtenidos:** en `F7 → Inventario → Rellenar objetos normales que ya tienes`, una sola acción aumenta la cantidad de los objetos normales existentes hasta el límite individual de cada uno (incluidos los límites configurados de 99/999/9999). No añade tipos de objetos nuevos ni cambia armas, armaduras, objetos clave u ocultos, ejemplares únicos u objetos que no admiten pilas. Respeta la gestión de inventario del juego y nunca reduce la cantidad existente. Haz una copia de la partida antes de modificar el inventario en masa.

**Búsqueda avanzada:** para buscar por valor en **Variables**, escribe `=125` (valor exacto), `>100`, `<50`, `>=100`, `<=50`, `=true`, `=false` o `=quest_started` (coincidencia exacta de texto, sin distinguir mayúsculas). Las comparaciones numéricas solo se aplican a variables numéricas, no a cadenas de texto. En **Interruptores**, usa `ON` / `OFF` o `=true` / `=false` / `=1` / `=0` para filtrar por estado. Sin operador, los números siguen buscando por nombre o ID. La búsqueda no modifica los valores del juego y solo muestra entradas con nombre.

**Notas:** el menú rápido conserva sus teclas y funciones originales. Durante los minijuegos, F7 muestra el menú sobre la escena actual sin recrear las ventanas de diálogo ni de elección; los eventos del mapa se pausan hasta cerrar el menú. Algunos plugins personalizados pueden requerir adaptaciones. El teletransporte y la edición de interruptores pueden afectar al progreso de la historia.
