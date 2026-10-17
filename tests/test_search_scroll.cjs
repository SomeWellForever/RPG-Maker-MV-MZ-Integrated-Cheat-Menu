/* In-engine scrollbar regression test for RPG Maker MV and MZ. */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const src=fs.readFileSync("SWF_CheatMenu.js","utf8");

assert.ok(src.includes("Scene_UniversalControl.prototype.items=function"),"Item catalog missing");
assert.ok(src.includes("Scene_UniversalControl.prototype.skills=function"),"Skill catalog missing");
assert.ok(src.includes("Scene_UniversalControl.prototype.maps=function"),"Map catalog missing");
assert.ok(src.includes("Scene_UniversalControl.prototype.extraSwitches=function"),"Switch search missing");
assert.ok(src.includes("Scene_UniversalControl.prototype.extraVariables=function"),"Variable search missing");
assert.ok(src.includes("Поиск по названию / ID"),"Search-by-name command missing");
assert.ok(!src.includes("_mountListTools"),"Old persistent HTML overlay remains");
assert.ok(!src.includes("_swfMouseMove"),"Old global mouse listener remains");

const start=src.indexOf("function Window_UniversalList()");
const stop=src.indexOf("function Scene_UniversalControl()",start);
assert.ok(start>0&&stop>start,"Cannot locate list/window implementation");
const js=src.slice(start,stop);

for(const mz of [false,true]){
    let mx=0,my=0,triggered=false,pressed=false;
    const touch={
       get x(){return mx},get y(){return my},
       isTriggered(){return triggered},isPressed(){return pressed}
    };
    function Bitmap(width,height){this.width=width;this.height=height;this.drawn=[];}
    Bitmap.prototype.clear=function(){this.drawn=[];};
    Bitmap.prototype.fillRect=function(...args){this.drawn.push(args);};
    function Sprite(bitmap){this.bitmap=bitmap;this.visible=true;this.x=0;this.y=0;}
    function Window_Command(){}
    Window_Command.prototype.initialize=function(...args){
        this.width=816;this.height=420;this.padding=12;this.x=0;
        this.y=mz?args[0].y:args[1];
        this._topRow=0;this._selected=0;this._items=32;this._touchCommands=0;
        this.active=true;this._children=[];
    };
    Window_Command.prototype.windowWidth=function(){return 816;};
    Window_Command.prototype.update=function(){this.processTouch();};
    Window_Command.prototype.processTouch=function(){this._touchCommands++;};
    Window_Command.prototype.maxTopRow=function(){return Math.max(0,this._items-8);};
    Window_Command.prototype.maxPageRows=function(){return 8;};
    Window_Command.prototype.maxItems=function(){return this._items;};
    Window_Command.prototype.topRow=function(){return this._topRow;};
    Window_Command.prototype.setTopRow=function(value){this._topRow=value;};
    Window_Command.prototype.index=function(){return this._selected;};
    Window_Command.prototype.select=function(value){this._selected=value;};
    Window_Command.prototype.addChild=function(sprite){this._children.push(sprite);};
    const env={Window_Command,Bitmap,Sprite,Rectangle:function(x,y){this.x=x;this.y=y;},
        Graphics:{boxWidth:816},TouchInput:touch,IS_MZ:mz,TR:x=>x};
    vm.createContext(env);
    vm.runInContext(js,env,{timeout:3000});
    const w=new env.Window_UniversalList(72,420);
    assert.equal(w._children.length,1,"Scrollbar sprite was not added");
    w.update();
    assert.equal(w._swfScrollBar.visible,true,"Long lists must show scrollbar");
    assert.ok(w._swfScrollBar.bitmap.drawn.length>=2,"Track and thumb must be drawn");
    const bar=w._swfScrollBar;
    mx=w.x+bar.x+5; my=w.y+bar.y+bar.bitmap.height-3;
    triggered=true;pressed=true;
    const clicksBefore=w._touchCommands;
    w.update();
    assert.equal(w._touchCommands,clicksBefore,"Dragging bar triggered cheat command");
    assert.ok(w.topRow()>0,"Scrollbar drag did not scroll down");
    triggered=false;pressed=false;
    w.update();
    assert.equal(w._swfDragging,false,"Scrollbar drag did not end");
    w._items=2;w.update();
    assert.equal(w._swfScrollBar.visible,false,"Short lists must hide scrollbar");
}
console.log("Native MV/MZ scrollbar tests passed, original name/ID search preserved");
