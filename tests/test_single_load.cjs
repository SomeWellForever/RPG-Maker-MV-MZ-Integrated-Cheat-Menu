/* Test the production single-load guard without requiring the RPG Maker runtime. */
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const plugin = fs.readFileSync("SWF_CheatMenu.js", "utf8");
const marker = "// Ignore a second load of this release";
const start = plugin.indexOf("(function () {", plugin.indexOf(marker));
const end = plugin.indexOf("/////////////////////////////////////////////////\n// Cheat Menu Plugin Class", start);
assert.ok(plugin.includes(marker) && start >= 0 && end > start, "Production guard not found");

// Execute the exact guard from the shipped script, replacing only the engine-dependent
// body with an instrumented keydown registration. This detects regressions where
// two loads install two listeners that toggle the menu twice on a single key press.
const bootstrap = plugin.slice(start, end) + `
window.addEventListener("keydown", function(event) {
    if (event.key === "1") window.quickMenuOpen = !window.quickMenuOpen;
});
})();
`;
assert.match(plugin, /window\.addEventListener\("keydown", function\(event\)/,
    "The real quick-menu keydown handler could not be found");

function createGameWindow() {
    const listeners = [];
    const window = {
        quickMenuOpen: false,
        addEventListener(name, callback) {
            assert.equal(name, "keydown");
            listeners.push(callback);
        }
    };
    const context = vm.createContext({window});
    return {window, context, listeners};
}

for (const game of [createGameWindow(), createGameWindow()]) {
    vm.runInContext(bootstrap, game.context, {timeout: 3000});
    vm.runInContext(bootstrap, game.context, {timeout: 3000});
    assert.equal(game.listeners.length, 1, "Duplicate script load registered a second hotkey");
    game.listeners[0]({key: "1"});
    assert.equal(game.window.quickMenuOpen, true, "First key press must open the menu");
    game.listeners[0]({key: "1"});
    assert.equal(game.window.quickMenuOpen, false, "Second key press must close the menu");
}
console.log("Quick-menu single-load regression passed: one listener, open/close, isolated game windows");
