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
    saved_position_page:0,positionSlotCount:10,
    ensureSavedPositions(){
        if(!Array.isArray(this.saved_positions))this.saved_positions=[];
        while(this.saved_positions.length<this.positionSlotCount)
            this.saved_positions.push({m:-1,x:-1,y:-1});
        this.saved_positions.length=this.positionSlotCount;
        return this.saved_positions;
    },
    append_scroll_selector(name,left,right,callback){output.push(["scroll",name,left,right,callback]);},
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
menu.append_save_recall(4,5,6,7,8,9);
const cheats=output.filter(x=>x[0]==="cheat");
assert.equal(cheats.length,6,"Three quick-menu slots require six commands");
assert.deepEqual(Array.from(cheats,x=>x[3]),[4,5,6,7,8,9],"Explicit hotkeys must preserve the previous bindings");
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
menu.append_save_recall(4,5,6,7,8,9);
assert.equal(output.filter(x=>x[0]==="cheat").length,6);
assert.equal(output.find(x=>x[0]==="cheat")[2],"NULL");
menu.save_position(0);
assert.equal(menu.saved_positions[0].m,1,"Malformed slot should be reconstructed before save");
assert.equal(menu.saved_positions[0].x,4);
menu.saved_positions.push({m:3,x:0,y:0});
output.length=0;menu.append_save_recall(4,5,6,7,8,9);
assert.equal(output.filter(x=>x[0]==="cheat").length,6,"More corrupted slots must not create an undefined hotkey");
assert.equal(destinations.length,2);
assert.equal(menu.saved_positions.length,10,"Older three-position saves must gain seven empty slots");
assert.equal(output.filter(x=>x[0]==="scroll").length,1,"Quick position page selector missing");
assert.deepEqual(Array.from(output.find(x=>x[0]==="scroll").slice(2,4)),[0,"-"],"Hotkeys 1/2/3 must retain their original overlay functions");
menu.scroll_saved_position_page("right");
assert.equal(menu.saved_position_page,1);
output.length=0;menu.append_save_recall(4,5,6,7,8,9);
assert.ok(output.some(x=>x[0]==="title"&&x[1]==="Position 4"));
assert.ok(output.some(x=>x[0]==="title"&&x[1]==="Position 6"));
assert.deepEqual(Array.from(output.filter(x=>x[0]==="cheat"),x=>x[3]),[4,5,6,7,8,9]);
menu.saved_position_page=3;
output.length=0;menu.append_save_recall(4,5,6,7,8,9);
assert.ok(output.some(x=>x[0]==="title"&&x[1]==="Position 10"));
assert.equal(output.filter(x=>x[0]==="cheat").length,2,"Fourth page must contain only slot 10");
menu.save_position(9);
assert.equal(menu.saved_positions[9].m,1);
menu.recall_position(9);
assert.deepEqual(Array.from(destinations.at(-1)),[1,4,6],"The tenth position must remain usable");
menu.scroll_saved_position_page("right");
assert.equal(menu.saved_position_page,0,"Pagination must wrap around after slot 10");

console.log("Quick save/recall tests passed: missing maps, invalid slots, deterministic keys, valid destinations");
