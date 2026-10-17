/* Test the trilingual native + legacy overlay localization without RPG Maker/NW.js. */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const plugin=fs.readFileSync("SWF_CheatMenu.js","utf8");
assert.ok(plugin.includes("if (window.__SWF_CHEAT_MENU_LOADED__) return;"),"Duplicate-load guard absent");
const anchor="var IS_MZ = Utils.RPGMAKER_NAME === 'MZ';";
const start=plugin.indexOf(anchor),end=plugin.indexOf("var openRequested = false;",start);
assert.ok(start>=0&&end>start,"Localization module not found");
const snippet=plugin.slice(start,end);
function context(gameLocale,systemLocale,stored){
    const storage={};
    if(stored)storage["SWF_CheatMenu.menuLanguage"]=stored;
    const item={id:1,name:"Меню управления",meta:{UniversalControl:true}};
    const quick={
        cheat_menu_open:false,updates:0,
        overlay_box:{style:{}},overlay:{style:{}},
        update_menu(){this.updates++;}
    };
    const ctx={
        Utils:{RPGMAKER_NAME:"MZ"},$dataSystem:{locale:gameLocale},
        navigator:{language:systemLocale},$dataItems:[null,item],ITEM_ID:1,
        itemIsControl:x=>!!(x&&x.meta&&x.meta.UniversalControl),
        Cheat_Menu:quick,
        window:{localStorage:{
            getItem(k){return storage[k]||null;},
            setItem(k,v){storage[k]=v;}
        }}
    };
    vm.createContext(ctx);
    vm.runInContext(snippet,ctx,{timeout:3000});
    return {ctx,item,quick,storage};
}
const autoRussian=context("ru_RU","en-US");
const autoEnglish=context("en_US","ru-RU");
const autoSpanish=context("es_MX","en-US");
const autoSystemSpanish=context("","es-ES");
assert.equal(autoRussian.ctx.swfCurrentLanguage(),"ru");
assert.equal(autoEnglish.ctx.swfCurrentLanguage(),"en");
assert.equal(autoSpanish.ctx.swfCurrentLanguage(),"es");
assert.equal(autoSystemSpanish.ctx.swfCurrentLanguage(),"es");
assert.equal(autoEnglish.ctx.TR("Меню управления"),"Control Menu");
assert.equal(autoSpanish.ctx.TR("Меню управления"),"Menú de control");
assert.equal(autoSpanish.ctx.swfLanguageLabel(),"Auto");
assert.equal(autoSpanish.ctx.Cheat_Menu.quickText("God Mode"),"Modo dios");
assert.equal(autoRussian.ctx.Cheat_Menu.quickText("God Mode"),"Бессмертие");
assert.equal(autoEnglish.ctx.Cheat_Menu.quickText("God Mode"),"God Mode");
assert.equal(autoSpanish.ctx.Cheat_Menu.quickText("Party Full HP"),"PV grupo máx.");
assert.equal(autoSpanish.ctx.Cheat_Menu.quickText("Position 3"),"Posición 3");
assert.equal(autoSpanish.ctx.Cheat_Menu.quickText("X: 3"),"X: 3");
assert.equal(autoSpanish.ctx.Cheat_Menu.quickText("PlayerGeneratedName"),"PlayerGeneratedName");
assert.equal(autoSpanish.ctx.Cheat_Menu.quickNull("NULL"),"—");
assert.equal(autoSpanish.ctx.Cheat_Menu.quickNull("Espada"),"Espada");
assert.equal(autoSpanish.ctx.Cheat_Menu.quickStatus(true),"sí");
assert.equal(autoSpanish.ctx.Cheat_Menu.quickStatus(false),"no");
assert.equal(autoSpanish.ctx.Cheat_Menu.quickStatus("<font color='#00ff00'>on</font>"),"<font color='#00ff00'>activado</font>");
assert.equal(autoRussian.ctx.Cheat_Menu.quickStatus("<font color='#ff0000'>off</font>"),"<font color='#ff0000'>выкл</font>");

const saved=context("en_US","en-US","ru");
assert.equal(saved.ctx.swfCurrentLanguage(),"ru");
assert.equal(saved.ctx.swfLanguageLabel(),"Русский");
saved.quick.cheat_menu_open=true;
saved.ctx.swfSetLanguage("es");
assert.equal(saved.ctx.swfCurrentLanguage(),"es");
assert.equal(saved.ctx.swfLanguageLabel(),"Español");
assert.equal(saved.storage["SWF_CheatMenu.menuLanguage"],"es");
assert.equal(saved.quick.updates,1,"Open quick overlay did not redraw after language switch");
assert.equal(saved.item.name,"Menú de control");
assert.ok(saved.item.description.includes("menú completo"));
saved.quick.quickLayout();
assert.equal(saved.quick.overlay.style.width,"370px");
saved.ctx.swfSetLanguage("en");
assert.equal(saved.quick.updates,2);
saved.quick.quickLayout();
assert.equal(saved.quick.overlay.style.width,"300px");
saved.ctx.swfSetLanguage("auto");
assert.equal(saved.ctx.swfCurrentLanguage(),"en");
assert.equal(saved.storage["SWF_CheatMenu.menuLanguage"],"auto");
saved.ctx.swfSetLanguage("xyz");
assert.equal(saved.storage["SWF_CheatMenu.menuLanguage"],"auto","Invalid locale must be ignored");

for(const [code,expected] of [["ru","Бессмертие"],["es","Modo dios"],["en","God Mode"]]){
    const x=context("en_US","en-US",code);
    assert.equal(x.ctx.swfCurrentLanguage(),code);
    assert.equal(x.ctx.Cheat_Menu.quickText("God Mode"),expected);
}
const keys=[...plugin.matchAll(/\bTR\('((?:\\.|[^'\\])*)'\)/g)]
    .map(m=>m[1].replace(/\\n/g,"\n"));
const russian=[...new Set(keys.filter(s=>/[А-Яа-яЁё]/.test(s)))];
assert.ok(russian.length>=195,"Missing previously localized strings");
const en=context("en_US","en-US").ctx,es=context("es_ES","en-US").ctx;
for(const key of russian){
    for(const [lang,ctx] of [["en",en],["es",es]]){
        const value=ctx.TR(key);
        assert.notEqual(value,key,"Missing "+lang+" translation: "+JSON.stringify(key));
        assert.ok(!/[А-Яа-яЁё]/.test(value),"Cyrillic text leaked to "+lang+": "+key);
    }
}
const quickLabels=[...plugin.slice(0,plugin.indexOf("// One menu added for each cheat/page"))
    .matchAll(/Cheat_Menu\.(?:append_title|append_cheat)\(\s*["']([^"']+)["']/g)].map(m=>m[1]);
const quickPages=[...plugin.slice(plugin.indexOf("// One menu added for each cheat/page"),plugin.indexOf("// update whats being displayed in menu"))
    .matchAll(/Cheat_Menu\.append_cheat_title\(\s*"([^"]+)"\)/g)].map(m=>m[1]);
const allLabels=[...new Set(quickLabels.concat(quickPages))];
assert.ok(allLabels.length>=42);
for(const label of allLabels){
    for(const lang of ["ru","es"]){
        const x=context("en_US","en-US",lang).ctx;
        assert.notEqual(x.Cheat_Menu.quickText(label),label,"Missing quick "+lang+" translation: "+label);
    }
}
assert.match(plugin,/Cheat_Menu\.quickLayout\(\)/,"Quick layout update not hooked to redraw");
assert.ok(plugin.includes("name:'Español'"),"Spanish selection missing");
console.log("Trilingual i18n checks passed: "+russian.length+" native strings and "+allLabels.length+" quick labels; RU/EN/ES, auto, status, game text, hot redraw");
