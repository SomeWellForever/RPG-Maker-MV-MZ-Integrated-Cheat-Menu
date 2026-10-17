/* Regression tests: explicit value searching must never change plain ID/name lookup. */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const plugin=fs.readFileSync("SWF_CheatMenu.js","utf8");
function fragment(start,end){
    const a=plugin.indexOf(start),b=plugin.indexOf(end,a+start.length);
    assert.ok(a>=0&&b>a,"Missing region "+start);
    return plugin.slice(a,b);
}
const state={
    $dataSystem:{
        switches:["","Gate 1","Open Door","NPC","Switch 10"],
        variables:["","Health","Quest Flag","Experience","Event State","Score","Quest string","Text number"]
    },
    variableData:[null,125,true,150,false,0,"quest_started","100"],
    switchData:[null,true,false,true,false],
    TR:s=>s,
    swfCatalogResultCount:rows=>rows.length,
    Scene_UniversalControl:function(){}
};
state.$gameVariables={
    _data:state.variableData,
    value(id){return this._data[id]||0;},
    setValue(id,value){this._data[id]=value;}
};
state.$gameSwitches={
    value(id){return !!state.switchData[id];},
    setValue(id,value){state.switchData[id]=!!value;}
};
vm.createContext(state);
vm.runInContext(fragment("// Search operators apply ONLY","// Display the same native control UI"),state,{timeout:3000});
const v=state.swfVariableSearch,k=state.swfSwitchSearch;
assert.equal(v(1,"Health",125,"Health"),true);
assert.equal(v(1,"Health",125,"HEA"),true);
assert.equal(v(1,"Health",125,"1"),true,"Plain numeric search must still find ID");
assert.equal(v(1,"Health",125,"125"),false,"Plain search must NOT search by value");
assert.equal(v(1,"Health",125,"=125"),true);
assert.equal(v(1,"Health",125,"=124"),false);
assert.equal(v(1,"Health",125," = 125 "),true);
assert.equal(v(1,"Health",125,">100"),true);
assert.equal(v(1,"Health",125,"<150"),true);
assert.equal(v(1,"Health",125,">=125"),true);
assert.equal(v(1,"Health",125,"<=125"),true);
assert.equal(v(1,"Health",125,">125"),false);
assert.equal(v(1,"Health",125,"<125"),false);
assert.equal(v(1,"Health",-12.25,"<-12"),true);
assert.equal(v(1,"Health",-12.25,"=-12.25"),true);
assert.equal(v(1,"Health",0,"=0"),true);
assert.equal(v(1,"Health",true,"=true"),true);
assert.equal(v(1,"Health",false,"=false"),true);
assert.equal(v(1,"Health",false,"=0"),false,"A boolean must not count as a number");
assert.equal(v(1,"Health",0,"=false"),false,"Numeric zero must not count as false");
assert.equal(v(1,"Health",true,">0"),false,"Boolean true must not count as 1");
assert.equal(v(1,"Health","100","=100"),false,"Numeric search must not coerce game text");
assert.equal(v(1,"Health","quest_started","=quest_started"),true);
assert.equal(v(1,"Health","Quest_Started","=quest_started"),true);
assert.equal(v(1,"Health"," quest_started "," = QUEST_STARTED "),true);
assert.equal(v(1,"Health","quest_started_again","=quest_started"),false,"Exact text matching should not use substring");
assert.equal(v(1,"Health","quest_started","=quest"),false);
for(const search of [">foo","<","=","==125",">=no","<Infinity","=NaN","=0 || alert(1)"]){
    assert.equal(v(1,"Health",125,search),false,"Malformed/unsafe query unexpectedly matched: "+search);
}
assert.equal(v(1,"Health",125,""),true);

assert.equal(k(1,"Gate 1",true,"1"),true,"Plain number must find switch ID or title");
assert.equal(k(2,"Open Door",false,"1"),false,"Plain numeric search must not mean state=ON");
assert.equal(k(2,"Open Door",false,"door"),true);
assert.equal(k(1,"Gate 1",true,"ON"),true);
assert.equal(k(2,"Open Door",false,"ON"),false);
assert.equal(k(1,"Gate 1",true,"OFF"),false);
assert.equal(k(2,"Open Door",false,"off"),true);
assert.equal(k(1,"Gate 1",true,"=true"),true);
assert.equal(k(2,"Open Door",false,"=false"),true);
assert.equal(k(1,"Gate 1",true,"=1"),true);
assert.equal(k(2,"Open Door",false,"=0"),true);
assert.equal(k(2,"Open Door",false,"false"),false,"Plain false must not change title/ID lookup");
assert.equal(k(2,"Open Door",false,"ВЫКЛ"),true);
assert.equal(k(1,"Gate 1",true,"ВКЛ"),true);
assert.equal(k(1,"Gate 1",true,"Sí"),true);
assert.equal(k(2,"Open Door",false,"NO"),true);
assert.equal(k(2,"Open Door",false,"=xyz"),false);
assert.equal(k(1,"Gate 1",true,""),true);

const ui=new state.Scene_UniversalControl();
ui._swfCatalogRows=function(kind,data,render,refresh,query){
    this.catalog={kind,data,render,refresh,query};
    return data.map(render);
};
ui.showPage=function(title,rows){this.page={title,rows};};
ui._swfRefreshCatalog=function(next){next();};
ui.ask=function(){};
ui.extraVariables("=125");
assert.equal(ui.catalog.kind,"variables");
assert.deepEqual(Array.from(ui.catalog.data,x=>x.id),[1]);
assert.match(ui.page.rows[0].name,/Health · 125/);
ui.extraVariables(">100");
assert.deepEqual(Array.from(ui.catalog.data,x=>x.id),[1,3]);
ui.extraVariables("=true");
assert.deepEqual(Array.from(ui.catalog.data,x=>x.id),[2]);
ui.extraVariables("=false");
assert.deepEqual(Array.from(ui.catalog.data,x=>x.id),[4],"Stored false should survive Game_Variables.value() normalizing it to zero");
ui.extraVariables("=quest_started");
assert.deepEqual(Array.from(ui.catalog.data,x=>x.id),[6]);
ui.extraVariables("=100");
assert.deepEqual(Array.from(ui.catalog.data,x=>x.id),[],"String 100 should not look like numeric 100");
ui.extraVariables("=0");
assert.deepEqual(Array.from(ui.catalog.data,x=>x.id),[5]);
ui.extraVariables("1");
assert.deepEqual(Array.from(ui.catalog.data,x=>x.id),[1],"Plain 1 should not find value 150");
ui.extraVariables("quest");
assert.deepEqual(Array.from(ui.catalog.data,x=>x.id),[2,6]);

ui.extraSwitches("ON");
assert.deepEqual(Array.from(ui.catalog.data,x=>x.id),[1,3]);
ui.page.rows[0].run(); // A switch is toggled and must no longer match ON.
assert.deepEqual(Array.from(ui.catalog.data,x=>x.id),[3]);
assert.equal(state.$gameSwitches.value(1),false);
ui.extraSwitches("=false");
assert.deepEqual(Array.from(ui.catalog.data,x=>x.id),[1,2,4]);
ui.extraSwitches("2");
assert.deepEqual(Array.from(ui.catalog.data,x=>x.id),[2],"Plain switch ID lookup preserved");
ui.extraSwitches("door");
assert.deepEqual(Array.from(ui.catalog.data,x=>x.id),[2],"Plain switch name lookup preserved");

assert.ok(plugin.includes("kind==='variables'?TR('Поиск переменных:"),
    "Variable-specific search help wasn't wired into native catalog");
assert.ok(plugin.includes("kind==='switches'?TR('Поиск переключателей:"),
    "Switch-specific search help wasn't wired into native catalog");
for(const key of ["Поиск переменных: название / ID, =125, >100, <50, =true или =quest_started.",
                  "Поиск переключателей: название / ID или состояние ON / OFF (=true / =false).",
                  "Имя / ID или значение (=125, >100, <50, =true, =text)",
                  "Имя / ID или ON / OFF"]){
    assert.ok(plugin.includes(JSON.stringify(key)), "Missing localized query prompt: "+key);
}
assert.match(plugin,/var SWF_ES_STRINGS = \{/);
assert.match(plugin,/var SWF_EN_STRINGS = \{/);
console.log("Value search tests passed: variable numeric/text/boolean comparisons, safe parsing, named switches, MV/MZ shared code.");
