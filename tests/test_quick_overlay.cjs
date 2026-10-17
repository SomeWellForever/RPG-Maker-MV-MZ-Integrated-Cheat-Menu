/* Smoke-test keyboard overlay in games that skip normal DataManager new/load hooks. */
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const src = fs.readFileSync("SWF_CheatMenu.js", "utf8");
const start = src.indexOf('window.addEventListener("keydown", function(event) {');
const stop = src.indexOf("\n});", start);
assert.ok(start >= 0 && stop > start, "Legacy keyboard handler not found");
const handler = src.slice(start, stop + 4);

function fixture(type) {
    let keyListener, init = 0, menu = 0, append = 0, sounds = 0;
    function Scene_Map() {}
    function Scene_Battle() {}
    const obj = {
        keyCodes: { KEYCODE_1: {keyCode: 49}, KEYCODE_TILDE: {keyCode: 192}},
        overlay_openable: false,
        cheat_menu_open: false,
        overlay_box: {},
        overlay: {},
        key_listeners: {},
        initialize() {init++; this.overlay_openable = true;},
        prepare() {},
        update_menu() {menu++;},
        close_overlay() {this.cheat_menu_open = false;}
    };
    const ctx = {
        Cheat_Menu: obj,
        window: {addEventListener(name, fn) {if(name === "keydown") keyListener = fn;}},
        Scene_Map, Scene_Battle,
        SceneManager: {_scene: type==="battle"?new Scene_Battle():type==="map"?new Scene_Map():{}},
        document: {body: {appendChild() {append++;}}},
        SoundManager: {playSystemSound() {sounds++;}},
        $gameActors: {_data: []},
        $gameSystem: {}
    };
    vm.runInNewContext(handler, ctx, {timeout: 3000});
    const send = changes => keyListener(Object.assign({
        keyCode: 49, repeat:false, altKey:false, ctrlKey:false, shiftKey:false,
        target: {tagName:"CANVAS"}
    }, changes||{}));
    return {ctx,obj,send,counts:()=>({init,menu,append,sounds})};
}
for (const scene of ["map","battle"]) {
    const f=fixture(scene);
    assert.equal(f.obj.overlay_openable,false);
    f.send();
    assert.equal(f.obj.cheat_menu_open,true, scene+" should open with Digit1");
    assert.deepEqual(f.counts(),{init:1,menu:1,append:2,sounds:1});
    f.send();
    assert.equal(f.obj.cheat_menu_open,false,scene+" should toggle close");
    assert.equal(f.counts().init,1,"init only once per game session");
    f.send();
    assert.equal(f.obj.cheat_menu_open,true,scene+" reopens");
}
for (const props of [{ctrlKey:true},{altKey:true},{shiftKey:true},{repeat:true},{keyCode:50},{target:{tagName:"INPUT"}}]) {
    const f=fixture("map");f.send(props);
    assert.equal(f.obj.cheat_menu_open,false,JSON.stringify(props));
}
const title=fixture("title");title.send();
assert.equal(title.obj.cheat_menu_open,false);
assert.equal(title.counts().init,0);
const fullMenu=fixture("battle");
fullMenu.ctx.SceneManager._scene._universalControlBattle = {};
fullMenu.send();
assert.equal(fullMenu.obj.cheat_menu_open,false,"should not open over F7 battle menu");
console.log("Legacy key 1 tests passed: map, battle, lazy startup, toggle/reopen, input guards");
