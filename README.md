# SWF Cheat Menu — RPG Maker MV/MZ

**[Русский](#-русский) · [English](#-english) · [Español](#-español)**

**v2.8.0 · Windows / Linux · RPG Maker MV / MZ**

[![Release](https://img.shields.io/github/v/release/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu?label=Release)](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/releases) [![Issues](https://img.shields.io/github/issues/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu)](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/issues)

[**Скачать / Download v2.8.0**](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/releases/download/v2.8.0/SWF_CheatMenu_MV_MZ_v2.8.0.zip) · [**Только плагин / Plugin only**](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/releases/download/v2.8.0/SWF_CheatMenu_plugin_only_v2.8.0.zip)

Чит-меню для одиночных игр RPG Maker MV/MZ: полное меню по `F7` или через предмет в инвентаре, быстрое — по `1`. Основано на Cheat Menu от emerladCoder и NamelessMagician.

A cheat menu for single-player RPG Maker MV/MZ games. Open the full menu with `F7` or a key item, and the quick menu with `1`.

---

## 🇷🇺 Русский

### Возможности

| Раздел | Что доступно |
| --- | --- |
| Персонажи и бой | Уровни, опыт, навыки, характеристики, HP/MP/TP, состояния, бессмертие, победа над врагами |
| Инвентарь | Выдача предметов и экипировки, лимиты 99/999/9999, пополнение уже имеющихся обычных предметов |
| Мир | Телепортация, 10 точек быстрого перемещения, проход через стены, скорость |
| Прогресс | Золото, переключатели и переменные |
| Поиск и прокрутка | По названию/ID, для переменных — по значению; ползунок в длинных списках |
| Избранное и сортировка | Звёздочки, общий раздел «Избранное», сортировка по ID, названию, категориям или избранному |

Главное меню — **2×3 плитки**; внутренние разделы — обычные списки. Во время боя «Мир» заменяется разделом «Бой», телепортация недоступна. Меню `F7` приостанавливает события карты, не пересоздавая сцену мини-игры.

### Управление

- `F7` — основное меню; `1` — быстрое меню, в том числе в бою. **«Меню управления»** — нерасходуемый предмет для открытия основного меню.
- **Настройки → Язык меню:** `Auto`, `Русский`, `English`, `Español`. Основное и быстрое меню переключаются вместе; названия из базы игры не переводятся.
- **Поиск:** первый пункт нужного списка. Обычный запрос ищет по названию или ID. В переменных: `=125`, `>100`, `<50`, `>=100`, `<=50`, `=true`, `=quest_started`. В переключателях: `ON` / `OFF` либо `=true` / `=false`. Запросы без оператора не ищут по значению.
- **Избранное:** включите «Редактирование ★», затем выбирайте записи для отметки. Звёздочки и сортировка сохраняются вместе с игровым сохранением.
- **10 точек перемещения:** `F7 → Мир и перемещение → Точки быстрого перемещения`. В быстром меню точки листаются тройками: `0` — назад, `-` — вперёд, `4–9` — сохранить/переместиться. Старые три точки сохраняются.
- **Пополнение:** `F7 → Инвентарь → Пополнить имеющиеся обычные предметы`. Доводит имеющиеся обычные предметы до лимита, не добавляя новых видов и не меняя уникальные, ключевые предметы и экипировку. Явно выбранные 99/999/9999 могут перекрывать `itemMaxNum` у обычных складываемых предметов. Совместимость с нестандартным инвентарём зависит от игры.

### Установка

1. Закройте игру и распакуйте архив **прямо в папку игры**.
2. Запустите `Install_Windows.cmd` или `bash Install_Linux.sh`. Установщик **сам найдёт игру**.
3. Запустите игру и откройте меню клавишей `F7` или `1`.

Если архив распакован в другую папку, установщик предложит выбрать игру. Устанавливать Python или Go не требуется.

**Обновление:** запустите установщик повторно. Он создаёт резервные копии в `SWF_CheatMenu_Backup/` и отключает распознанную конфликтующую старую запись `Cheat_Menu`. Удаление: `Remove_Windows.cmd` / `bash Remove_Linux.sh`.

**Архив без установщика:** подходит только для уже установленного мода. Замените `www/js/plugins/SWF_CheatMenu.js` (или `js/plugins/SWF_CheatMenu.js`) файлом из архива, предварительно сохранив копию.

**Mac и Xenolauncher:** уже пропатченную на Windows или Linux игру можно перенести на Mac и попробовать запустить через [Xenolauncher](https://github.com/m5kro/Xenolauncher). Отключите его `Enable Cheat Menu` во избежание конфликта. Совместимость зависит от игры и её плагинов.

### Важно

Сделайте отдельное сохранение: телепортация и переключатели могут нарушить игровые события. Некоторые плагины инвентаря, интерфейса и боя требуют адаптации; автоматические тесты **не гарантируют** работу во всех играх. Если обнаружена ошибка — [создайте Issue](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/issues/new/choose) с версией игры, шагами и текстом ошибки. При срабатывании антивируса не отключайте защиту и не добавляйте исключений — отправьте файл на проверку.

---

## 🇬🇧 English

### Features

| Section | Functions |
| --- | --- |
| Characters & battle | Levels, EXP, skills, stats, HP/MP/TP, status effects, god mode, instant victory |
| Inventory | Give items/equipment, 99/999/9999 stack limits, refill owned normal items |
| World | Teleport, ten saved positions, no-clip, movement speed |
| Progress | Gold, switches, variables |
| Search and scrolling | Name/ID search, variable-value filters, scrollbar for long lists |
| Favorites and sorting | Starred entries, a Favorites section, sort by ID, name, category or favorites first |

The full menu uses a **two-column (2×3)** layout. During battle, Battle replaces World and teleportation is disabled. `F7` pauses map events without rebuilding active mini-game scenes.

### Controls

- `F7` — full menu; `1` — quick menu, also available in battle. The reusable **Control Menu** key item opens the full menu.
- **Settings → Menu language:** `Auto`, `Русский`, `English`, `Español`. The full and quick menu use the same language; game database names stay unchanged.
- **Search:** select the first command in a catalog. Plain text/numbers match names or IDs. Variables accept `=125`, `>100`, `<50`, `>=100`, `<=50`, `=true`, `=quest_started`. Switches accept `ON` / `OFF` or `=true` / `=false`. Without an operator, values are not searched.
- **Favorites:** enable Edit ★ and select an entry to star or unstar it. Favorites and sorting are stored in each game save.
- **Ten saved positions:** `F7 → World & travel → Fast travel points`. In the quick menu, `0` / `-` change groups of three, `4–9` save/recall positions. All three old slots are preserved.
- **Owned-item refill:** `F7 → Inventory → Refill owned normal items`. Tops up existing normal items only; no new item types, key items, unique items or equipment. Explicit 99/999/9999 limits can override ordinary items' `itemMaxNum` notes. Custom inventory plugins may behave differently.

### Installation

1. Close the game and extract the ZIP **directly into the game folder**.
2. Run `Install_Windows.cmd` or `bash Install_Linux.sh`. The installer **detects the game automatically**.
3. Launch the game. Open the menus with `F7` or `1`.

If you extracted the ZIP somewhere else, select the game folder when prompted. Neither Python nor Go is required.

**Update:** run the installer again. It backs up changed files to `SWF_CheatMenu_Backup/` and disables recognized conflicting legacy `Cheat_Menu` entries. Uninstall using `Remove_Windows.cmd` or `bash Remove_Linux.sh`.

**Plugin-only alternative:** for existing installations only. Back up and replace `www/js/plugins/SWF_CheatMenu.js` (or `js/plugins/SWF_CheatMenu.js`) with the file in the plugin-only ZIP.

**Mac and Xenolauncher:** a game already patched on Windows or Linux can be transferred to macOS and tried with [Xenolauncher](https://github.com/m5kro/Xenolauncher). Disable its `Enable Cheat Menu` option to avoid conflicts. Compatibility depends on the game and its plugins.

### Notes

Back up your save: teleportation and changing switches can disrupt events. Some game-specific plugins need custom fixes; automated tests **cannot guarantee** compatibility with every game. [Report issues](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/issues/new/choose) with the game version, reproduction steps and error details. If antivirus software flags a file, do not disable protection or allowlist it; submit the detection for review.

---

## 🇪🇸 Español

### Funciones

**SWF Cheat Menu** incluye edición de personajes, inventario, combate, variables, interruptores, teletransporte, **diez puntos** guardados, favoritos, ordenación y búsqueda por nombre, ID o valor. El menú completo (`F7`) tiene seis secciones; el menú rápido (`1`) funciona también durante el combate.

### Controles

- `F7` — menú completo; `1` — menú rápido. El objeto `Menú de control` también abre el menú completo.
- **Ajustes → Idioma:** `Auto`, `Русский`, `English` o `Español`. Ambos menús cambian de idioma; los nombres de la base de datos del juego permanecen intactos.
- **Buscar por valor:** en Variables, utiliza `=125`, `>100`, `<50`, `=true` o `=quest_started`. En Interruptores, `ON` / `OFF` o `=true` / `=false`. Sin operador, se busca por nombre o ID.
- **Viaje rápido:** los diez puntos están en `F7 → Mundo y viaje`. En el menú rápido, `0` y `-` cambian de grupo; `4–9` guardan y recuperan puntos. Se conservan los tres puntos anteriores.
- **Inventario:** `F7 → Inventario → Rellenar objetos normales que ya tienes`. Completa las cantidades de objetos normales que ya posees sin añadir tipos nuevos, modificar objetos clave, únicos ni equipo. Los límites 99/999/9999 pueden sustituir notas `itemMaxNum` de objetos normales acumulables.

### Instalación

1. Cierra el juego y extrae el ZIP **directamente en la carpeta del juego**.
2. Ejecuta `Install_Windows.cmd` o `bash Install_Linux.sh`. El instalador detecta el juego automáticamente.
3. Inicia el juego y abre el menú con `F7` o `1`.

Para actualizar, ejecuta de nuevo el instalador. Si el mod ya estaba instalado, también puedes reemplazar `www/js/plugins/SWF_CheatMenu.js` (o `js/plugins/SWF_CheatMenu.js`) con el archivo del ZIP **Plugin only**, guardando una copia anterior. Para desinstalar, usa `Remove_Windows.cmd` o `bash Remove_Linux.sh`.

**Precaución:** haz una copia de tu partida antes de modificar el inventario o los eventos. Algunos juegos necesitan adaptaciones de compatibilidad. Si utilizas [Xenolauncher](https://github.com/m5kro/Xenolauncher) en macOS con una copia ya modificada en Windows o Linux, desactiva `Enable Cheat Menu`.

---

### Files and credits / Файлы и авторы

**[Releases](https://github.com/SomeWellForever/RPG-Maker-MV-MZ-Integrated-Cheat-Menu/releases)** · [Plugin](SWF_CheatMenu.js) · [Changelog](CHANGELOG.md) · [Credits and redistribution](CREDITS.md)

Original Cheat Menu: [emerladCoder](https://github.com/emerladCoder/RPG-Maker-MV-Cheat-Menu-Plugin). MV/MZ adaptation: [NamelessMagician](https://github.com/NamelessMagician/RPG-Maker-MV-MZ-Cheat-Menu-Plugin). Integrated edition: SomeWellForever.

**Licensing / Лицензирование:** условия распространения оригинального кода требуют подтверждения. См. [CREDITS.md](CREDITS.md); отдельная лицензия для всего производного проекта не заявлена.
