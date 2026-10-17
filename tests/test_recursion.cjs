/* Regression tests for duplicate RPG Maker Cheat Menu installs and shared DataManager hooks. */
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("SWF_CheatMenu.js", "utf8");
assert.match(source, /window\.__SWF_CheatMenuLoaded\s*=\s*true/);
assert.doesNotMatch(source, /DataManager\.default_(loadGame|setupNewGame|saveGame)\s*=/);

// A second evaluation of the full plugin must exit before accessing the RPG Maker engine.
let warning = "";
const contextWithDuplicate = {
    window: {__SWF_CheatMenuLoaded: true},
    console: {warn: text => warning = String(text)}
};
vm.runInNewContext(source, contextWithDuplicate, {timeout: 3000});
assert.match(warning, /Duplicate load skipped/);

// Extract and independently run just the legacy DataManager hooks with RPG Maker stubs.
// Wrapping in separate closures mimics different scripts loaded in one game.
const start = source.indexOf("// Capture previous methods in this plugin's own closure");
const stop = source.indexOf("// Integrated universal in-engine menu", start);
assert.ok(start >= 0 && stop > start, "Missing legacy hook boundaries");
const hookSource = source.slice(start, stop);
assert.match(hookSource, /swfPreviousSetupNewGame\.apply\(this,\s*arguments\)/);
assert.match(hookSource, /swfPreviousLoadGame\.apply\(this,\s*arguments\)/);
assert.match(hookSource, /swfPreviousSaveGame\.apply\(this,\s*arguments\)/);

function engine() {
    const calls = {load: 0, newGame: 0, save: 0, initialize: 0};
    const system = {Cheat_Menu: null};
    const context = {
        DataManager: {
            loadGame() {calls.load++; return "loaded";},
            setupNewGame() {calls.newGame++; return "new game";},
            saveGame() {calls.save++; return "saved";}
        },
        Cheat_Menu: {
            initial_values: {level: 8},
            level: 8,
            initialize() {calls.initialize++;}
        },
        $gameSystem: system
    };
    vm.createContext(context);
    return {calls, context, system};
}
const a = engine();
vm.runInContext("(function () {\n" + hookSource + "\n})();", a.context, {timeout: 3000});
// Simulate an older plugin referencing the shared (and mutable) DataManager aliases.
const oldPrevious = a.context.DataManager.setupNewGame;
a.context.DataManager.default_setupNewGame = oldPrevious;
a.context.DataManager.setupNewGame = function () {
    return a.context.DataManager.default_setupNewGame();
};
// Another plugin overrides the shared alias, which used to trigger an infinite cycle.
a.context.DataManager.default_setupNewGame = oldPrevious;
vm.runInContext("(function () {\n" + hookSource + "\n})();", a.context, {timeout: 3000});
assert.equal(a.context.DataManager.setupNewGame(), "new game");
assert.equal(a.calls.newGame, 1, "base new game must run exactly once");
assert.equal(a.calls.initialize, 2, "two layers of hooks should each initialize once");
assert.equal(a.context.DataManager.loadGame("slot"), "loaded");
assert.equal(a.context.DataManager.saveGame("slot"), "saved");
assert.equal(a.calls.load, 1);
assert.equal(a.calls.save, 1);
assert.equal(a.system.Cheat_Menu.level, 8);

// Enforce return-value and this binding preservation for game-specific plugins.
const b = engine();
const customContext = {prefix: "custom"};
b.context.DataManager.setupNewGame = function () {
    assert.equal(this, customContext);
    b.calls.newGame++;
    return 42;
};
b.context.DataManager.setupNewGame = b.context.DataManager.setupNewGame.bind(customContext);
vm.runInContext("(function () {\n" + hookSource + "\n})();", b.context, {timeout: 3000});
assert.equal(b.context.DataManager.setupNewGame(), 42);
assert.equal(b.calls.newGame, 1);
console.log("Recursion regression passed: duplicate script no-op, repeated hooks safe, load/new/save protected.");
