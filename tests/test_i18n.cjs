/* Test the embedded bilingual dictionary without loading RPG Maker or NW.js. */
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const plugin = fs.readFileSync("SWF_CheatMenu.js", "utf8");
assert.ok(plugin.includes("if (window.__SWF_CHEAT_MENU_LOADED__) return;"), "Missing duplicate-load guard");
const anchor = "var IS_MZ = Utils.RPGMAKER_NAME === 'MZ';";
const from = plugin.indexOf(anchor);
const until = plugin.indexOf("var openRequested = false;", from);
assert.ok(from >= 0 && until > from, "Cannot locate localization module");
const snippet = plugin.slice(from, until);

function context(gameLocale, osLocale, stored) {
    const storage = {};
    if (stored) storage["SWF_CheatMenu.menuLanguage"] = stored;
    const item = {id: 1, name: "Меню управления", meta: {UniversalControl: true}};
    const ctx = {
        Utils: {RPGMAKER_NAME: "MZ"},
        $dataSystem: {locale: gameLocale},
        navigator: {language: osLocale},
        $dataItems: [null, item],
        ITEM_ID: 1,
        itemIsControl: x => !!(x && x.meta && x.meta.UniversalControl),
        window: {localStorage: {
            getItem(k) {return storage[k] || null;},
            setItem(k,v) {storage[k] = v;}
        }}
    };
    vm.createContext(ctx);
    vm.runInContext(snippet, ctx, {timeout: 3000});
    return {ctx,item,storage};
}
const autoRussian = context("ru_RU", "en-US");
assert.equal(autoRussian.ctx.swfCurrentLanguage(),"ru");
assert.equal(autoRussian.ctx.TR("Меню управления"),"Меню управления");
const autoEnglish = context("en_US", "ru-RU");
assert.equal(autoEnglish.ctx.swfCurrentLanguage(),"en");
assert.equal(autoEnglish.ctx.TR("Меню управления"),"Control Menu");
const fallbackEnglish = context("", "en-US");
assert.equal(fallbackEnglish.ctx.swfCurrentLanguage(),"en");
assert.equal(fallbackEnglish.ctx.TR("Установить золото"),"Set gold");
const savedRussian = context("en_US", "en-US", "ru");
assert.equal(savedRussian.ctx.swfCurrentLanguage(),"ru");
savedRussian.ctx.swfSetLanguage("en");
assert.equal(savedRussian.ctx.swfCurrentLanguage(),"en");
assert.equal(savedRussian.storage["SWF_CheatMenu.menuLanguage"],"en");
assert.equal(savedRussian.item.name,"Control Menu");
assert.ok(savedRussian.item.description.includes("full menu"));
savedRussian.ctx.swfSetLanguage("auto");
assert.equal(savedRussian.ctx.swfCurrentLanguage(),"en");
assert.equal(savedRussian.storage["SWF_CheatMenu.menuLanguage"],"auto");

// Every Russian UI literal that was wrapped in TR must have an English translation.
// Game database names are intentionally not translated.
const wrapped = [...plugin.matchAll(/\bTR\('((?:\\.|[^'\\])*)'\)/g)];
const russian = [...new Set(wrapped.map(x => x[1]).filter(x => /[А-Яа-яЁё]/.test(x)))];
assert.ok(russian.length >= 150,"Unexpectedly few localizable UI strings");
const enContext = context("en_US","en-US").ctx;
for (const key of russian) {
    // The original literal token may contain JS-escaped newlines.
    const runtimeKey = key.replace(/\\n/g,"\n");
    const translation = enContext.TR(runtimeKey);
    assert.notEqual(translation, runtimeKey,"Missing English translation: " + key);
    assert.ok(!/[А-Яа-яЁё]/.test(translation),"Cyrillic remains in English translation: " + key);
}
assert.ok(plugin.includes("name:TR('Язык меню: ')"),"Language selector missing from main menu");
console.log("Localization checks passed: " + russian.length + " UI texts, automatic detection, saved overrides, control-item refresh");
