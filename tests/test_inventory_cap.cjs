/* Inventory compatibility: manual cap selection overrides ordinary itemMaxNum notes. */
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const src=fs.readFileSync("SWF_CheatMenu.js","utf8");
const from=src.indexOf("function selectedStackLimit() {"),to=src.indexOf("function clean(s)",from);
assert.ok(from>=0&&to>from,"Inventory limit shim not found");
const gameSystem={_universalControlItemCap:0};
function Party(){this.owned={};}
Party.prototype.numItems=function(item){return this.owned[item.id]||0;};
Party.prototype.maxItems=function(item){
    const found=String(item.note||"").match(/itemMaxNum:(\d+)/);
    return found?Number(found[1]):99;
};
const ordinary={id:1,name:"Potion",itypeId:1,note:"itemMaxNum:5",meta:{}};
const unique={id:2,name:"Unique",itypeId:1,note:"itemMaxNum:1",meta:{IndependentItem:true}};
const nonstack={id:3,name:"No stack",itypeId:1,note:"",meta:{NoStack:true}};
const equipment={id:4,name:"Weapon",kind:"weapon",note:"itemMaxNum:1",meta:{}};
const key={id:5,name:"Quest",itypeId:2,note:"itemMaxNum:1",meta:{}};
const ctx={
 $gameSystem:gameSystem,Game_Party:Party,TR:s=>s,
 DataManager:{
    isItem:item=>item.kind!=="weapon",
    isWeapon:item=>item.kind==="weapon",isArmor:item=>item.kind==="armor",
    isIndependent:item=>!!item.meta.IndependentItem
 },
 itemIsControl:()=>false
};
vm.createContext(ctx);vm.runInContext(src.slice(from,to),ctx,{timeout:3000});
const party=new Party();
assert.equal(party.maxItems(ordinary),5,"Original note cap should remain in default mode");
gameSystem._universalControlItemCap=999;
assert.equal(party.maxItems(ordinary),999,"Manual cap must override ordinary itemMaxNum notes");
assert.equal(party.maxItems(unique),1,"Independent-item caps remain protected");
assert.equal(party.maxItems(nonstack),99,"Nonstackable items remain on original rules");
assert.equal(party.maxItems(equipment),1,"Equipment-specific note caps remain protected");
assert.equal(party.maxItems(key),1,"Key item note caps remain protected");
party.owned[1]=1200;
assert.equal(party.maxItems(ordinary),1200,"Lowering cap must not erase existing excess");
party.owned[1]=3;
gameSystem._universalControlItemCap=99;
assert.equal(party.maxItems(ordinary),99,"Explicit 99 replaces itemMaxNum:5");
gameSystem._universalControlItemCap=9999;
assert.equal(party.maxItems(ordinary),9999);
gameSystem._universalControlItemCap=0;
assert.equal(party.maxItems(ordinary),5,"Default should restore the game's note cap");
assert.equal(ctx.selectedStackLimit(),0);
console.log("Inventory cap tests passed: note-defined caps, explicit 99/999/9999, unique/special restrictions and reverting default");
