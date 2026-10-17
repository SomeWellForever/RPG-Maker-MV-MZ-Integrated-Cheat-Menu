/* Map mini-game regression: F7 must not recreate a ChoiceList or restart events. */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const plugin=fs.readFileSync("SWF_CheatMenu.js","utf8");
function region(a,b){const i=plugin.indexOf(a),j=plugin.indexOf(b,i+a.length);assert.ok(i>=0&&j>i,"Missing "+a);return plugin.slice(i,j);}
assert.ok(!plugin.includes("openRequested = false; ensureItem(); SceneManager.push(Scene_UniversalControl)"),
    "Old map scene-changing F7 fallback is still active");
for(const mz of [false,true]){
    const counts={mapUpdate:0,baseUpdate:0,push:0,terminates:0,item:0,prepare:0,initChoice:0};
    function Scene_Base(){}
    Scene_Base.prototype.update=function(){counts.baseUpdate++;};
    function Scene_Map(){}
    Scene_Map.prototype.update=function(){counts.mapUpdate++;};
    Scene_Map.prototype.terminate=function(){counts.terminates++;};
    Scene_Map.prototype.addChildAt=function(obj){obj.parent=this;this.layers.push(obj);};
    Scene_Map.prototype.getChildIndex=function(){return 1;};
    Scene_Map.prototype.addWindow=function(obj){obj.parent=this;this.layers.push(obj);};
    Scene_Map.prototype.removeChild=function(obj){const i=this.layers.indexOf(obj);if(i>=0)this.layers.splice(i,1);obj.parent=null;};
    function Scene_Battle(){}
    function Scene_UniversalControl(){}
    Scene_UniversalControl.prototype.main=function(){this.mainOpened=(this.mainOpened||0)+1;};
    Scene_UniversalControl.prototype.choose=function(){};
    Scene_UniversalControl.prototype.back=function(){};
    const pendingMaps=[];
    Scene_UniversalControl.prototype.mapDetail=function(m){this.lastMapDetail=m;};
    const oldChoice={active:true,deactivate(){this.active=false;},activate(){this.active=true;}};
    const oldMessage={active:true,deactivate(){this.active=false;},activate(){this.active=true;}};
    counts.initChoice=1; // Window_ChoiceList was created when the map started.
    const winChildren=[oldMessage,oldChoice];
    const map=new Scene_Map();
    map.layers=[];
    map._windowLayer={children:winChildren};
    const manager={
        _scene:map,
        isSceneChanging(){return false;},
        push(){counts.push++;throw Error("Menu must not replace map scene!");},
        pop(){throw Error("Must not pop a scene when the editor is on the map!");}
    };
    const callbacks={};
    const doc={addEventListener(name,cb){callbacks[name]=cb;}};
    function Bitmap(width,height){this.width=width;this.height=height;this.fillAll=function(){};}
    function Sprite(bitmap){this.bitmap=bitmap;this.opacity=255;this.destroy=function(){this.destroyed=true;};}
    function Rectangle(x,y,width,height){this.x=x;this.y=y;this.width=width;this.height=height;}
    function Window_Help(arg){
        this.height=mz?arg.height:arg*36+36;
        this.y=mz?arg.y:0;
        this.active=true;this.deactivate=function(){this.active=false;};
        this.activate=function(){this.active=true;};
        this.destroy=function(){this.destroyed=true;};
        this.setText=function(text){this.lastText=text;};
    }
    function Window_UniversalList(){
        this.height=200;this.active=true;
        this.setHelpWindow=function(){};
        this.setHandler=function(){};
        this.deactivate=function(){this.active=false;};
        this.destroy=function(){this.destroyed=true;};
    }
    const ctx={
        Scene_Map,Scene_Battle,Scene_Base,Scene_UniversalControl,
        SceneManager:manager,document:doc,
        IS_MZ:mz,Graphics:{width:816,height:624,boxWidth:816,boxHeight:624},
        Bitmap,Sprite,Rectangle,Window_Help,Window_UniversalList,
        $gamePlayer:{isTransferring(){return false;}},
        Input:{clear(){}},TouchInput:{clear(){}},
        Cheat_Menu:{close_overlay(){},prepare(){counts.prepare++;},cheat_menu_open:false},
        ensureItem(){counts.item++;},
        readMap(id,callback){pendingMaps.push(callback);},
        TR:s=>s, candidatePoint:()=>[1,1,2],knownEntrances:()=>[],
        openRequested:false
    };
    vm.createContext(ctx);
    vm.runInContext(region("document.addEventListener('keydown', function(e) {","// Special item is always visible"),ctx,{timeout:3000});
    vm.runInContext(region("var oldMapUpdate = Scene_Map.prototype.update;","// Recheck landing tiles against active"),ctx,{timeout:3000});
    vm.runInContext(region("Scene_UniversalControl.prototype.close=function(){","Scene_UniversalControl.prototype.notice=function"),ctx,{timeout:3000});
    vm.runInContext(region("// The map editor uses the same in-scene layout","window.Scene_UniversalControl=Scene_UniversalControl;"),ctx,{timeout:3000});
    vm.runInContext(region("Scene_UniversalControl.prototype.loadMapDetail=function","Scene_UniversalControl.prototype.mapDetail=function"),ctx,{timeout:3000});
    // A mini-game can have pending Show Choices. F7 must not initialize a second message window.
    let prevented=false;
    callbacks.keydown({keyCode:118,repeat:false,preventDefault(){prevented=true;}});
    assert.equal(prevented,true);
    map.update();
    const ui=map._universalControlMap;
    assert.ok(ui,"F7 did not open an embedded menu");
    assert.equal(ctx.SceneManager._scene,map,"Map scene was replaced");
    assert.equal(counts.push,0,"Map scene was pushed on F7");
    assert.equal(counts.initChoice,1,"Window_ChoiceList was reconstructed");
    assert.equal(ui._mapScene,map);
    assert.equal(ui._battleMode,false);
    assert.equal(ui.mainOpened,1,"Native full control menu did not open");
    assert.equal(oldChoice.active,false,"Pending choices should be inactive during editor");
    assert.equal(oldMessage.active,false,"Existing message window must be paused");
    assert.equal(counts.mapUpdate,1,"Map update should run only once before opening");
    map.update();
    assert.equal(counts.mapUpdate,1,"Mini-game update continued while control menu was open");
    assert.equal(counts.baseUpdate,1,"UI and sprites stopped updating while editor is open");
    assert.equal(map._windowLayer.children[1],oldChoice,"Choice window identity changed");
    assert.equal(map._windowLayer.children[0],oldMessage,"Message window identity changed");
    // Teleport page requests are asynchronous: the embedded editor must still
    // accept map data, and it must ignore responses after that editor closes.
    const entry={id:7,name:"Test map"};
    ui.loadMapDetail(entry);
    assert.equal(pendingMaps.length,1);
    pendingMaps[0](null,{displayName:"Loaded map",width:14,height:16});
    assert.equal(ui.lastMapDetail.name,"Loaded map","Map details ignored by new in-scene editor");
    const staleEntry={id:8,name:"Stale map"};
    ui.loadMapDetail(staleEntry);
    assert.equal(pendingMaps.length,2);
    // Closing via Escape must restore precisely the previous game windows.
    ui.close();
    pendingMaps[1](null,{displayName:"Late result",width:18,height:16});
    assert.equal(ui.lastMapDetail.name,"Loaded map","Late map load updated a closed editor");
    assert.equal(map._universalControlMap,null);
    assert.equal(oldChoice.active,true);
    assert.equal(oldMessage.active,true);
    assert.equal(counts.initChoice,1);
    assert.equal(map.layers.length,0,"Editor display objects leaked");
    map.update();
    assert.equal(counts.mapUpdate,2,"Mini-game did not resume after editor closed");
    // Hotkey toggling again must close in-scene without a new open request.
    map.openUniversalControl();
    assert.ok(map._universalControlMap);
    callbacks.keydown({keyCode:118,repeat:false,preventDefault(){}});
    assert.equal(map._universalControlMap,null,"F7 failed to close embedded menu");
    assert.equal(ctx.openRequested,false,"F7 close left a pending editor request");
    // Changing scenes while menu is open cleans it without reactivating stale windows.
    map.openUniversalControl();
    assert.equal(oldChoice.active,false);
    map.terminate();
    assert.equal(counts.terminates,1);
    assert.equal(map._universalControlMap,null);
    assert.equal(oldChoice.active,false,"Window should not reactivate during scene termination");
    assert.equal(map.layers.length,0);
    assert.equal(counts.initChoice,1,"Termination should not reconstruct choices");
    assert.equal(counts.push,0);
}
console.log("Map minigame F7 regression passed for MV/MZ: no scene replacement, choices preserved, interpreter paused, input restored");
