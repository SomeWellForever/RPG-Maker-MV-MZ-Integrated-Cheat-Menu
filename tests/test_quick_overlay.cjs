/* Quick overlay visibility, key-1 toggle and menu scene lifecycle regressions. */
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const src = fs.readFileSync("SWF_CheatMenu.js", "utf8");
const overlayStart = src.indexOf("Cheat_Menu.close_overlay = function()");
const overlayEnd = src.indexOf("Cheat_Menu.prepare = function()", overlayStart);
const keyStart = src.indexOf('window.addEventListener("keydown", function(event) {', overlayEnd);
const keyEnd = src.indexOf("\n});", keyStart);
assert.ok(overlayStart>=0 && overlayEnd>overlayStart && keyStart>overlayEnd && keyEnd>keyStart);
const handler = src.slice(overlayStart,overlayEnd) + "\n" + src.slice(keyStart,keyEnd+4);

function fixture(scene) {
    let keyListener, init=0, menu=0, sounds=[], prevented=0, starts=0;
    function Scene_Map() {}
    function Scene_Battle() {}
    function Scene_Menu() {}
    const classes={map:Scene_Map,battle:Scene_Battle,menu:Scene_Menu};
    const body = {
        children: [],
        appendChild(el) {
            if(el.parentNode) el.parentNode.removeChild(el);
            this.children.push(el);
            el.parentNode=this;
        },
        removeChild(el) {
            const i=this.children.indexOf(el);
            if(i<0)throw Error("not attached");
            this.children.splice(i,1);
            el.parentNode=null;
        }
    };
    function node(){
        const rules={};
        return {parentNode:null,rules,style:{setProperty(k,v,priority){rules[k]={value:v,priority}}}};
    }
    const cheat={
        keyCodes:{KEYCODE_1:{keyCode:49},KEYCODE_TILDE:{keyCode:192}},
        overlay_openable:false,cheat_menu_open:false,
        overlay_box:node(),overlay:node(),
        key_listeners:{},
        initialize(){init++;this.overlay_openable=true;},
        prepare(){},
        update_menu(){menu++;}
    };
    const ctx={
        Cheat_Menu:cheat,Scene_Map,Scene_Battle,Scene_Menu,
        window:{addEventListener(name,fn){if(name==="keydown")keyListener=fn;}},
        SceneManager:{_scene:new classes[scene](),onSceneStart(){starts++;}},
        document:{body},
        SoundManager:{playSystemSound(n){sounds.push(n)}},
        $gameActors:{_data:[]},$gameSystem:{}
    };
    vm.runInNewContext(handler,ctx,{timeout:3000});
    const send = changes => keyListener(Object.assign({
        keyCode:49,repeat:false,altKey:false,ctrlKey:false,shiftKey:false,
        target:{tagName:"CANVAS"}, preventDefault(){prevented++}
    },changes||{}));
    return {ctx,cheat,body,send,classes,counts:()=>({init,menu,sounds:[...sounds],prevented,starts})};
}
for(const scene of ["map","battle"]) {
    const f=fixture(scene);
    f.send();
    assert.equal(f.cheat.cheat_menu_open,true,scene+" must open on 1");
    assert.equal(f.body.children.length,2,scene+" must append visible overlay and background");
    assert.equal(f.counts().init,1);
    assert.equal(f.counts().menu,1);
    assert.equal(f.cheat.overlay_box.rules.position.value,"fixed");
    assert.equal(f.cheat.overlay.rules.position.value,"fixed");
    assert.equal(f.cheat.overlay.rules["z-index"].value,"2147483646");
    assert.equal(f.cheat.overlay.rules["z-index"].priority,"important");
    assert.deepEqual(f.counts().sounds,[1]);
    f.send();
    assert.equal(f.cheat.cheat_menu_open,false,scene+" must close on second 1");
    assert.equal(f.body.children.length,0,"DOM must be fully detached");
    assert.deepEqual(f.counts().sounds,[1,2]);
    f.send();
    assert.equal(f.cheat.cheat_menu_open,true,"overlay must reopen");
    assert.equal(f.counts().init,1,"initialize only once");
}
for(const props of [{ctrlKey:true},{altKey:true},{shiftKey:true},{repeat:true},{keyCode:50},{target:{tagName:"INPUT"}}]) {
    const f=fixture("map");f.send(props);
    assert.equal(f.cheat.cheat_menu_open,false,JSON.stringify(props));
}
const title=fixture("menu");title.send();
assert.equal(title.cheat.cheat_menu_open,false,"cannot open from main menu when closed");
const battleF7=fixture("battle");
battleF7.ctx.SceneManager._scene._universalControlBattle={};
battleF7.send();
assert.equal(battleF7.cheat.cheat_menu_open,false,"cannot open over F7 battle menu");

// Key-1 must close even if a game's custom in-game menu replaced the scene.
const switchScene=fixture("map");
switchScene.send();
switchScene.ctx.SceneManager._scene=new switchScene.classes.menu();
switchScene.send();
assert.equal(switchScene.cheat.cheat_menu_open,false,"key 1 closes in other scene");
assert.equal(switchScene.body.children.length,0,"no stuck overlay after closing from menu");

// Actual scene transitions should close the menu even without another key.
const transition=fixture("map");
transition.send();
transition.ctx.SceneManager._scene=new transition.classes.menu();
transition.ctx.SceneManager.onSceneStart();
assert.equal(transition.cheat.cheat_menu_open,false,"menu must close on scene change");
assert.equal(transition.body.children.length,0,"no overlay survives scene change");
assert.equal(transition.counts().starts,1,"normal SceneManager callback retained");

// Legacy quick menu should NOT stick after a battle/menu to map transition.
const returnToMap=fixture("battle");
returnToMap.send();
returnToMap.ctx.SceneManager._scene=new returnToMap.classes.map();
returnToMap.ctx.SceneManager.onSceneStart();
returnToMap.send();
assert.equal(returnToMap.cheat.cheat_menu_open,true,"fresh overlay on newly activated map");
assert.equal(returnToMap.body.children.length,2,"exactly one overlay pair");

console.log("Quick overlay tests passed: top-layer visibility, 1 toggles in all scenes, no scene-transition orphans.");
