/* Quick overlay: do not crash when a saved map was removed or a save contains invalid map slots. */
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const source=fs.readFileSync("SWF_CheatMenu.js","utf8");
const start=source.indexOf("Cheat_Menu.save_position = function"),end=source.indexOf("// Left and right scrollers for handling switching between target teleport map",start);
const teleStart=source.indexOf("Cheat_Menu.teleport_current_location = function"),teleEnd=source.indexOf("// append the teleport cheat to the menu",teleStart);
assert.ok(start>0&&end>start&&teleStart>0&&teleEnd>teleStart);
const output=[];
const music=[];
const destinations=[];
const menu={
    saved_positions:[
        {m:2,x:10,y:11}, // Map #2 was deleted after creating this save
        {m:3,x:8,y:9},
        {m:-1,x:-1,y:-1}
    ],
    teleport_location:{m:2,x:5,y:5},
    append_title(value){output.push(["title",value]);},
    append_description(value){output.push(["description",value]);},
    append_cheat(name,status,key,callback){output.push(["cheat",name,status,key,callback]);},
    teleport(...args){destinations.push(args);},
    update_menu(){this.rebuilt=(this.rebuilt||0)+1;}
};
const ctx={Cheat_Menu:menu,$dataMapInfos:[null,{name:"Home"},null,{name:"Cave"}],
    $gameMap:{mapId(){return 1;}},$gamePlayer:{x:4,y:6},
    SoundManager:{playSystemSound(type){music.push(type);}}};
vm.createContext(ctx);
vm.runInContext(source.slice(start,end),ctx,{timeout:3000});
vm.runInContext(source.slice(teleStart,teleEnd),ctx,{timeout:3000});
assert.ok(!source.includes('eval("key"'),"Unsafe eval() for quick keys remains");
menu.append_save_recall(1,2,3,4,5,6);
const cheats=output.filter(x=>x[0]==="cheat");
assert.equal(cheats.length,6,"Three quick-menu slots require six commands");
assert.deepEqual(Array.from(cheats,x=>x[3]),[1,2,3,4,5,6],"Explicit hotkeys must preserve the previous bindings");
assert.equal(cheats[0][2],"NULL","Removed saved map should display NULL");
assert.equal(cheats[1][2],"NULL","Removed saved map coordinate should not be shown as usable");
assert.equal(cheats[2][2],"3: Cave");
assert.equal(cheats[3][2],"(8, 9)");
menu.recall_position(0);
assert.equal(destinations.length,0,"Removed map must never trigger teleport");
assert.equal(music.at(-1),2,"Invalid destination should play failure sound");
menu.recall_position(1);
assert.deepEqual(Array.from(destinations[0]),[3,8,9]);
assert.equal(music.at(-1),1);
menu.teleport_current_location();
assert.equal(destinations.length,1,"Manual teleport to missing map must be rejected");
assert.equal(music.at(-1),2);
menu.teleport_location.m=3;
menu.teleport_current_location();
assert.deepEqual(Array.from(destinations[1]),[3,5,5]);
menu.saved_positions[0]=null;
output.length=0;
menu.append_save_recall(1,2,3,4,5,6);
assert.equal(output.filter(x=>x[0]==="cheat").length,6);
assert.equal(output.find(x=>x[0]==="cheat")[2],"NULL");
menu.save_position(0);
assert.equal(menu.saved_positions[0].m,1,"Malformed slot should be reconstructed before save");
assert.equal(menu.saved_positions[0].x,4);
menu.saved_positions.push({m:3,x:0,y:0});
output.length=0;menu.append_save_recall(1,2,3,4,5,6);
assert.equal(output.filter(x=>x[0]==="cheat").length,6,"More corrupted slots must not create an undefined hotkey");
assert.equal(destinations.length,2);
console.log("Quick save/recall tests passed: missing maps, invalid slots, deterministic keys, valid destinations");
