/* Regression: one-click restock only owned, normal, stackable DB items. */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const plugin=fs.readFileSync("SWF_CheatMenu.js","utf8");
function section(a,b){
 const start=plugin.indexOf(a),end=plugin.indexOf(b,start+a.length);
 assert.ok(start>=0&&end>start,"Missing section "+a);
 return plugin.slice(start,end);
}
const make=(id,name,itypeId=1,more={})=>Object.assign({id,name,itypeId,meta:{},note:""},more);
const db=[null,
 make(1,"Potion"),make(2,"Ether"),make(3,"Key",2),
 make(4,"Helmet",1,{kind:"armor"}),make(5,"Sword",1,{kind:"weapon"}),
 make(6,"Not owned"),make(7,"Unique",1,{meta:{IndependentItem:true}}),
 make(8,"Capped",1,{note:"<itemMaxNum:5>"}),
 make(9,"No stacking",1,{meta:{NoStack:true}}),
 make(10,"Base item"),make(11,"At cap"),make(12,"Invalid cap"),
 make(13,"Broken gain"),make(14,"Over cap"),make(15,"Huge cap"),
 make(16,"Other note",1,{meta:{Independent:true}}),
 make(17,"Bad count getter"),make(18,"Bad independence getter")
];
const clone=make(10,"Unique instance");
const nums={1:3,2:99,3:1,4:2,5:1,7:2,8:2,9:2,10:1,11:5,12:4,13:2,14:200,15:1,16:4,17:2,18:1};
const max={1:99,2:99,3:99,4:99,5:99,7:99,8:5,9:99,10:99,11:5,12:Infinity,13:10,14:99,15:20000,16:99,17:99,18:99};
let gains=[],throws=0;
const party={
 items(){return [db[1],db[1],db[2],db[3],db[4],db[5],db[7],db[8],db[9],clone,
 db[11],db[12],db[13],db[14],db[15],db[16],db[17],db[18]];},
 numItems(item){if(item.id===17)throw Error("Third-party numItems error");return nums[item.id]||0;},
 maxItems(item){return max[item.id];},
 gainItem(item,count,includeEquip){
   assert.equal(includeEquip,false,"Bulk refill must never touch equipped objects");
   assert.ok(count>0&&Number.isInteger(count),"Invalid refill quantity");
   if(item.id===13){throws++;throw Error("Custom item gain error");}
   gains.push({id:item.id,count});
   nums[item.id]=Math.min(max[item.id],(nums[item.id]||0)+count);
 }
};
const ctx={
 $dataItems:db,$gameParty:party,BASE_COUNTS:{items:19},ITEM_ID:100,
 DataManager:{
   isItem(item){return item&&item.kind!=="weapon"&&item.kind!=="armor"&&item.itypeId>0;},
   isIndependent(item){if(item.id===18)throw Error("Third-party isIndependent error");return item===clone;}
 },
 itemIsControl:item=>item&&item.id===100,
 console:{warn(){throws++;}},
 TR:s=>s,stackLimitLabel:()=>"99",
 Scene_UniversalControl:function(){}
};
vm.createContext(ctx);
vm.runInContext(section("// Refill only already-owned ordinary database items.",
 "Scene_UniversalControl.prototype.sectionInventory=function"),ctx,{timeout:3000});
vm.runInContext(section("Scene_UniversalControl.prototype.sectionInventory=function",
"Scene_UniversalControl.prototype.sectionWorld=function"),ctx,{timeout:3000});
const original=Object.assign({},nums);
const ui=new ctx.Scene_UniversalControl();
ui._swfOnlyFavorites={};ui._swfEditingFavorites={};
ui.showPage=function(title,rows){this.lastPage={title,rows};};
ui.itemCategories=function(){};
ui.stackLimits=function(){};
ui.notice=function(msg){this.lastNotice=msg;};
ui.sectionInventory();
assert.equal(ui.lastPage.rows.length,3,"Refill command not in Inventory");
assert.equal(ui.lastPage.rows[1].name,"Пополнить имеющиеся обычные предметы");
ui.lastPage.rows[1].run();
assert.equal(nums[1],99,"Potion should reach game cap");
assert.equal(nums[8],5,"Per-item note override cap should be respected");
assert.equal(nums[15],9999,"Protect against excessively large custom limits");
assert.equal(nums[2],99,"Already full item must remain untouched");
for(const id of [3,4,5,7,9,10,11,12,13,14,16,17,18]){
 assert.equal(nums[id],original[id],"Unsafe/unchanged type modified: "+id);
}
assert.equal(nums[6],undefined,"Must not create items not in inventory");
assert.deepEqual(Array.from(gains,g=>g.id),[1,8,15],
 "Should only use normal RPG Maker gainItem on eligible owned items");
assert.equal(throws,4,"Broken third-party queries and a gainItem failure must be isolated");
assert.match(ui.lastNotice,/Пополнено видов: 3/);
assert.match(ui.lastNotice,/ · добавлено предметов: 10097/);
assert.match(ui.lastNotice,/ · пропущено: 4/);
const beforeSecond=gains.length;
ui.lastPage.rows[1].run();
assert.equal(gains.length,beforeSecond,"Refill should be idempotent");
assert.match(ui.lastNotice,/Пополнено видов: 0/);
const saved=nums[1];nums[1]=0;
ui.lastPage.rows[1].run();
assert.equal(nums[1],0,"Previously owned but currently exhausted item must not be created");
const originalItems=party.items;
party.items=function(){throw Error("Third-party items() exception");};
const failure=ctx.swfRefillOwnedNormalItems();
assert.equal(failure.types,0);
assert.equal(failure.added,0);
assert.equal(failure.skipped,1,"A broken items() implementation should return a safe result");
party.items=originalItems;

assert.ok(!plugin.includes("gainItem(item,amount,true)"));
assert.ok(plugin.includes("swfRefillOwnedNormalItems"));
for(const translated of ["Refill owned normal items","Rellenar objetos normales que ya tienes"]){
 assert.ok(plugin.includes(translated),"Missing full-menu localization "+translated);
}
console.log("Owned-item refill tests passed: normal-only, existing-only, max caps, custom limits, independent, key/equipment, errors, repeat safety");
