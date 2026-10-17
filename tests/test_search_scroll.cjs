/* Regression tests for live search and the visual scrollbar (without RPG Maker). */
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const source=fs.readFileSync("SWF_CheatMenu.js","utf8");
function part(start,end){
  const a=source.indexOf(start),b=source.indexOf(end,a+start.length);
  assert.ok(a>=0&&b>a,"Cannot locate plugin code: "+start);
  return source.slice(a,b);
}
const filterCode=part("function swfFilterRows(","function Window_UniversalList()");
const swfFilterRows=vm.runInNewContext(filterCode+";swfFilterRows;");
const rows=[
 {name:"Search legacy",searchRow:true},
 {name:"#4 · Лечебное зелье"},
 {name:"#15 · Короткий меч"},
 {name:"#217 · Fire Potion"},
 {name:"#227 · Potion of Mana"}
];
function names(q){return Array.from(swfFilterRows(rows,q)).map(x=>x.name);}
assert.deepEqual(names(""),rows.slice(1).map(x=>x.name));
assert.deepEqual(names("зЕЛЬе"),["#4 · Лечебное зелье"]);
assert.deepEqual(names("POTION"),["#217 · Fire Potion","#227 · Potion of Mana"]);
assert.deepEqual(names("227"),["#227 · Potion of Mana"]);
assert.deepEqual(names("   меч  "),["#15 · Короткий меч"]);
assert.deepEqual(names("not present"),[]);
assert.deepEqual(Array.from(swfFilterRows(null,"")),[]);
assert.ok(source.includes("self._page.searchText=input.value"),"Input is not wired to live search");
assert.ok(source.includes("ui.main();ui._mountListTools();"),"Battle UI search bar was not mounted");
assert.ok(source.includes("ui._removeListTools();"),"Battle UI did not remove controls");
assert.ok(source.includes("this._removeListTools();if(this._modal)"),"Map UI did not remove controls");

const syncCode=part("Scene_UniversalControl.prototype._syncListTools=function(){","Scene_UniversalControl.prototype._removeListTools=function(){");
const context={
 Graphics:{width:816,height:624,boxWidth:816,boxHeight:624,_canvas:{getBoundingClientRect(){return {left:10,top:20,width:816,height:624};}}},
 Scene_UniversalControl:function(){},
};
vm.createContext(context);vm.runInContext(syncCode,context,{timeout:3000});
const makeNode=()=>({style:{}});
const layer=makeNode(),input=makeNode(),count=makeNode(),track=makeNode(),thumb=makeNode();
const state={_swfTools:layer,_swfSearchInput:input,_swfSearchCount:count,_swfTrack:track,_swfThumb:thumb,
 _titleWindow:{height:72},
 _listWindow:{y:116,height:364,
  maxTopRow(){return 90;},maxPageRows(){return 10;},maxItems(){return 100;},topRow(){return 45;}}
};
context.Scene_UniversalControl.prototype._syncListTools.call(state);
assert.equal(track.style.display,"block");
assert.equal(track.style.top,"121px");
assert.ok(parseInt(thumb.style.height,10)>0&&parseInt(thumb.style.height,10)<parseInt(track.style.height,10));
assert.ok(parseInt(thumb.style.top,10)>0,"Scroll thumb must move with scroll position");
assert.equal(input.style.top,"76px");
state._listWindow.maxTopRow=()=>0;
context.Scene_UniversalControl.prototype._syncListTools.call(state);
assert.equal(track.style.display,"none","Short lists must not show a scrollbar");
console.log("Search and scrollbar tests passed (Russian/English/ID, menu/battle cleanup, scroll geometry)");
