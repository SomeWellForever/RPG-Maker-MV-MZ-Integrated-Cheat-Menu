/* v2.5.0: per-save favorites, native two-column menu and catalog commands. */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const source=fs.readFileSync("SWF_CheatMenu.js","utf8");
const part=(begin,end)=>{
    let a=source.indexOf(begin),b=source.indexOf(end,a+begin.length);
    assert.ok(a>=0&&b>a,"Cannot extract plugin section "+begin);
    return source.slice(a,b);
};
const saved1={},saved2={};
const ctx={$gameSystem:saved1,TR:s=>s,clean:s=>String(s||""),
           Scene_UniversalControl:function(){},Window_Command:function(){},
           IS_MZ:false,Graphics:{boxWidth:816},Bitmap:function(){},Sprite:function(){}};
vm.createContext(ctx);
vm.runInContext(part("function swfFavorites(","function Window_UniversalList()"),ctx,{timeout:3000});
assert.equal(ctx.swfFavoriteCount("items"),0);
ctx.swfToggleFavorite("items",42);
ctx.swfToggleFavorite("maps",42);
assert.equal(ctx.swfIsFavorite("items",42),true);
assert.equal(ctx.swfIsFavorite("weapons",42),false);
assert.equal(ctx.swfFavoriteCount("maps"),1);
ctx.swfToggleFavorite("items",42);
assert.equal(ctx.swfIsFavorite("items",42),false);
ctx.swfToggleFavorite("items",3);
assert.ok(JSON.stringify(saved1).includes('"_swfFavorites"'),"Favorites not stored on save");
ctx.$gameSystem=saved2;
assert.equal(ctx.swfFavoriteCount("items"),0,"Favorites leaked to a different save");
ctx.swfToggleFavorite("items",7);
assert.equal(ctx.swfFavoriteCount("items"),1);
ctx.$gameSystem=saved1;

const items=[{id:10,name:"Яблоко"},{id:2,name:"Броня"},{id:3,name:"меч"}];
const ids=x=>Array.from(x,entry=>entry.id);
assert.deepEqual(ids(ctx.swfSortCatalog(items,"items")),[2,3,10],"Default order must be numeric ID");
ctx.swfCycleSort("items");
assert.equal(ctx.swfSortMode("items"),"name");
assert.deepEqual(ids(ctx.swfSortCatalog(items,"items")),[2,3,10],"Russian alphabetical names sorted");
ctx.swfCycleSort("items");
assert.equal(ctx.swfSortMode("items"),"favorites");
assert.deepEqual(ids(ctx.swfSortCatalog(items,"items")),[3,2,10],"Starred entry should come first");
ctx.swfCycleSort("items");
assert.equal(ctx.swfSortMode("items"),"id");
assert.ok(JSON.stringify(saved1).includes("_swfSortModes"),"Sort settings not stored in save");

// Catalog row click must be harmless when editing favorites and normal otherwise.
vm.runInContext(part("Scene_UniversalControl.prototype.showPage=","Scene_UniversalControl.prototype.back="),ctx,{timeout:3000});
const ui=new ctx.Scene_UniversalControl();
ui._swfOnlyFavorites={};ui._swfEditingFavorites={};ui._swfKeepIndex=0;
ui._listWindow={index(){return 5;}};
ui.ask=function(){throw Error("Search dialog should not open");};
let refreshCalls=0,actionCalls=0;
const refresh=()=>{refreshCalls++;};
function render(item){return {name:"#"+item.id+" "+item.name,run:()=>{actionCalls++;}};}
let rows=ui._swfCatalogRows("weapons",items,render,refresh,"");
assert.equal(rows.length,7,"Four controls plus three catalog entries");
assert.ok(rows[4].name.startsWith("☆"),"Unstarred entries must show empty star");
rows[4].run();
assert.equal(actionCalls,1,"Ordinary click should execute normal action");
rows[3].run(); // Enable edit-star mode.
assert.equal(ui._swfEditingFavorites.weapons,true);
rows=ui._swfCatalogRows("weapons",items,render,refresh,"");
rows[4].run();
assert.equal(actionCalls,1,"Star editing must not execute a cheat");
assert.equal(ctx.swfFavoriteCount("weapons"),1);
assert.ok(ui._swfKeepIndex>=0&&refreshCalls>=2);
rows=ui._swfCatalogRows("weapons",items,render,refresh,"");
assert.ok(rows.some(r=>r.name.startsWith("★")),"Starred row missing");
rows[2].run(); // Favorites-only filter.
rows=ui._swfCatalogRows("weapons",items,render,refresh,"");
assert.equal(rows.length,5,"Favorites-only must show exactly one entry");
rows[4].run(); // Unstar it; entry disappears on next refresh.
rows=ui._swfCatalogRows("weapons",items,render,refresh,"");
assert.equal(rows.length,4,"Unstarring while filtered must hide the entry");

vm.runInContext(part("// The six categories are the only commands","Scene_UniversalControl.prototype.savedPositions=function"),ctx,{timeout:3000});
ui._pages=[];ui._swfOnlyFavorites={};ui._swfEditingFavorites={};
ui.showPage=function(title,rows,replace,grid){this.page={title,rows,replace,grid};};
ui._battleMode=false;
ui.main();
assert.equal(ui.page.grid,true);
assert.deepEqual(Array.from(ui.page.rows,r=>r.name),[
    "Персонажи и отряд","Инвентарь","Мир и перемещение","Прогресс игры","Избранное","Настройки"
]);
ui._battleMode=true;ui.main();
assert.deepEqual(Array.from(ui.page.rows,r=>r.name),[
    "Персонажи и отряд","Инвентарь","Прогресс игры","Бой","Избранное","Настройки"
]);
ui.favorites();
assert.ok(!ui.page.rows.some(r=>r.name.startsWith("Карты")),"Battle favorites must not allow teleport");
ui._battleMode=false;ui.favorites();
assert.ok(ui.page.rows.some(r=>r.name.startsWith("Карты")),"Map favorites should exist outside battle");

// Grid only changes main menu: all list pages retain one column and inherited
// scroll/selection behavior. Create minimal MV/MZ-friendly Window_Command mocks.
for(const mz of [false,true]){
    function Bitmap(width,height){this.width=width;this.height=height;this.fillRect=()=>{};this.clear=()=>{};}
    function Sprite(bitmap){this.bitmap=bitmap;this.visible=true;}
    function Window_Command(){}
    Window_Command.prototype.initialize=function(x,y){
        this.width=816;this.height=410;this.padding=12;this.x=0;this.y=mz?x.y:y;
        this.contents={fontSize:22,textColor:"#fff",fillRect(){}};
        this._children=[];this.active=true;
    };
    Window_Command.prototype.itemHeight=function(){return 36;};
    Window_Command.prototype.addChild=function(child){this._children.push(child);};
    Window_Command.prototype.refresh=function(){this._rendered=[];for(let n=0;n<this._rows.length;n++)this.drawItem(n);};
    Window_Command.prototype.itemRect=function(n){return {x:(n%this.maxCols())*400,y:Math.floor(n/this.maxCols())*100,width:400,height:100};};
    Window_Command.prototype.drawItem=function(n){this._rendered.push(this._rows[n].name);};
    Window_Command.prototype.drawText=function(t){this._rendered.push(t);};
    Window_Command.prototype.resetTextColor=function(){};
    Window_Command.prototype.changeTextColor=function(){};
    Window_Command.prototype.changePaintOpacity=function(){};
    Window_Command.prototype.select=function(n){this._index=n;};
    Window_Command.prototype.activate=function(){this.active=true;};
    const winEnv={Bitmap,Sprite,Window_Command,Graphics:{boxWidth:816},Rectangle:function(x,y){this.y=y;},IS_MZ:mz,TR:s=>s,TouchInput:{isTriggered(){return false},isPressed(){return false}}};
    vm.createContext(winEnv);
    vm.runInContext(part("function Window_UniversalList()","function Scene_UniversalControl()"),winEnv,{timeout:3000});
    const win=new winEnv.Window_UniversalList(72,410);
    win.setRows([{name:"World & travel",subtitle:"Maps"}],0,true);
    assert.equal(win.maxCols(),2);
    assert.ok(win.itemHeight()>=80);
    assert.ok(win._rendered.includes("World & travel"));
    win.setRows([{name:"Some item"}],0,false);
    assert.equal(win.maxCols(),1);
    assert.equal(win.itemHeight(),36);
}
assert.ok(!source.includes("2147483000"),"Old persistent search layer returned");
console.log("Favorites and native grid tests passed (saves, categories, sort, actions, MV/MZ, battle)");
