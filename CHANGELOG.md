# Changelog / История версий

Документация может обновляться отдельно от архивов; опубликованные релизы не перезаписываются.
Documentation can change without replacing published release files.

## v2.8.0 · 2026-10
- **RU:** 10 точек телепортации вместо 3; старые сохранения переносятся. В быстром меню группы листаются `0` / `-`. Повышенные лимиты могут перекрывать `itemMaxNum` обычных предметов. Для Konoha нужна проверка в игре.
- **EN:** Ten fast-travel slots with old-save migration and quick-menu paging (`0` / `-`). Explicit limits override ordinary-item `itemMaxNum` notes. Konoha compatibility needs live testing.

## v2.7.1 · 2026-10
- **RU:** Массовая выдача продолжает работу при ошибках отдельного предмета. Защита от удалённых карт/повреждённых точек; убран `eval()`. Исправлена документация.
- **EN:** Isolated inventory-plugin errors, guarded missing maps/corrupted travel slots, removed `eval()`, and updated docs.

## v2.7.0 · 2026-10
- **RU:** Пополнение уже имеющихся обычных предметов до лимита; без добавления новых видов и изменения уникальных/ключевых предметов.
- **EN:** One-click refill of owned normal items up to per-item caps; excludes new types and unique/key items.

## v2.6.2 · 2026-10
- **RU:** Поиск переменных по значению (`=125`, `>100`, `=true`, `=text`) и переключателей по `ON/OFF`.
- **EN:** Variable-value comparisons and exact matches; switch `ON/OFF` filters. Name/ID search remains.

## v2.6.1 · 2026-10
- **RU:** Меню `F7` работает внутри сцены карты, сохраняя окна событий/мини-игр; исправлен возможный сбой `Window_ChoiceList`.
- **EN:** F7 preserves existing map/choice windows, avoiding a possible `Window_ChoiceList` crash.

## v2.6.0 · 2026-10
- **RU:** Испанский язык; единая настройка RU/EN/ES для основного и быстрого меню.
- **EN:** Spanish added; shared RU/EN/ES selection for both menus.

## v2.5.1 · 2026-10
- **RU:** Сортировка предметов, экипировки и навыков по категориям базы игры.
- **EN:** Database category sorting for items, equipment and skills.

## v2.5.0 · 2026-10
- **RU:** Главное меню 2×3, избранное в каталогах и отдельном разделе; сортировка по ID/названию/избранному. Настройки привязаны к сохранению.
- **EN:** Six-tile main menu; per-save Favorites, star editing and sorting.

## v2.4.1 · 2026-10
- **RU:** Нативный ползунок вместо HTML-слоя; поиск первым пунктом списка; отдельный архив Plugin Only. Антивирусное срабатывание на ZIP v2.4.0 осталось непроверенным.
- **EN:** Native scrollbar, catalog search command and plugin-only archive. The v2.4.0 antivirus detection was not verified.

## v2.4.0 · 2026-10
- **RU:** Поиск над списком и перетаскиваемая HTML-полоса прокрутки.
- **EN:** Live search and an HTML-based draggable scrollbar.

## v2.3.1 · 2026-10
- **RU:** Исправлена миграция старой записи `Cheat_Menu` и двойная загрузка плагина.
- **EN:** Fixed old-plugin migration and duplicate loading.

## v2.3.0 · 2026-10
- **RU:** RU/EN основное меню и автономные установщики Windows/Linux.
- **EN:** RU/EN full menu and native Windows/Linux installers.

## v2.2.0 · archive
- **RU:** Предыдущая версия объединённого меню и установщика.
- **EN:** Earlier integrated menu and installer.

Актуальная версия / Current release: [README.md](README.md).
