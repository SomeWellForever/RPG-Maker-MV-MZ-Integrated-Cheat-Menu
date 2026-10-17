/*:
 * @target MV MZ
 * @plugindesc SWF Cheat Menu Integrated 2.5.0: legacy overlay (1) + one universal control item (F7), MV/MZ.
 * @author emerladCoder, NamelessMagician; integrated edition: SomeWellForever
 * @help F7 or the 'Control Menu' / 'Меню управления' key item opens the full menu,
 * including during battle. Choose Auto / Русский / English inside that menu.
 * Key 1 opens the legacy English quick overlay, including during battle.
 * Item, skill and map names are taken from the game, not translated.
 * The key item is usable in battle without consuming a turn.
 * Contains original Cheat_Menu features plus RPG Maker MV/MZ control menu.
 */



// Ignore a second load of this release: otherwise each copy registers
// another keydown listener and key 1 can instantly close the overlay.
(function () {
if (typeof window !== 'undefined') {
    if (window.__SWF_CHEAT_MENU_LOADED__) return;
    window.__SWF_CHEAT_MENU_LOADED__ = true;
}
/////////////////////////////////////////////////
// Cheat Menu Plugin Class
/////////////////////////////////////////////////
// Check if already defined (allows game specific extensions to be loaded in any order)
if (typeof Cheat_Menu == "undefined") { Cheat_Menu = {}; }

Cheat_Menu.initialized = false;
Cheat_Menu.cheat_menu_open = false;
Cheat_Menu.overlay_openable = false;
Cheat_Menu.position = 1;
Cheat_Menu.menu_update_timer = null;

Cheat_Menu.cheat_selected = 0;
Cheat_Menu.cheat_selected_actor = 1;
Cheat_Menu.amounts = [1, 10, 100, 1000, 10000, 100000, 1000000];
Cheat_Menu.amount_index = 0;
Cheat_Menu.stat_selection = 0;
Cheat_Menu.item_selection = 1;
Cheat_Menu.weapon_selection = 1;
Cheat_Menu.armor_selection = 1;
Cheat_Menu.move_amounts = [0.5, 1, 1.5, 2];
Cheat_Menu.move_amount_index = 1;

Cheat_Menu.variable_selection = 1;
Cheat_Menu.switch_selection = 1;

Cheat_Menu.saved_positions = [{m: -1, x: -1, y: -1}, {m: -1, x: -1, y: -1}, {m: -1, x: -1, y: -1}];

Cheat_Menu.teleport_location = {m: 1, x: 0, y: 0};

Cheat_Menu.speed = null;
Cheat_Menu.speed_unlocked = true;
Cheat_Menu.speed_initialized = false;


/////////////////////////////////////////////////
// Initial values for reseting on new game/load
/////////////////////////////////////////////////

// Check if already defined (allows game specific extensions to be loaded in any order)
if (typeof Cheat_Menu.initial_values == "undefined") { Cheat_Menu.initial_values = {}; }


// All values below are the inital values for a new saved game
//	upon loading a saved game these values will be loaded from the
//	save game if possible overwriting the below values
//	Because of this all of these variables should be non recursive
Cheat_Menu.initial_values.position = 1;
Cheat_Menu.initial_values.cheat_selected = 0;
Cheat_Menu.initial_values.cheat_selected_actor = 1;
Cheat_Menu.initial_values.amount_index = 0;
Cheat_Menu.initial_values.stat_selection = 0;
Cheat_Menu.initial_values.item_selection = 1;
Cheat_Menu.initial_values.weapon_selection = 1;
Cheat_Menu.initial_values.armor_selection = 1;
Cheat_Menu.initial_values.move_amount_index = 1;
Cheat_Menu.initial_values.variable_selection = 1;
Cheat_Menu.initial_values.switch_selection = 1;
Cheat_Menu.initial_values.saved_positions = [{m: -1, x: -1, y: -1}, {m: -1, x: -1, y: -1}, {m: -1, x: -1, y: -1}];
Cheat_Menu.initial_values.teleport_location = {m: 1, x: 0, y: 0};
Cheat_Menu.initial_values.speed = null;
Cheat_Menu.initial_values.speed_unlocked = true;

/////////////////////////////////////////////////
// Cheat Functions
/////////////////////////////////////////////////

// enable god mode for an actor
Cheat_Menu.god_mode = function(actor) {
	if (actor instanceof Game_Actor && !(actor.god_mode)) {
		actor.god_mode = true;

		actor.gainHP_bkup = actor.gainHp;
		actor.gainHp = function(value) {
			value = this.mhp;
			this.gainHP_bkup(value);
		};

		actor.setHp_bkup = actor.setHp;
		actor.setHp = function(hp) {
			hp = this.mhp;
			this.setHp_bkup(hp);
		};

		actor.gainMp_bkup = actor.gainMp;
		actor.gainMp = function (value) {
			value = this.mmp;
			this.gainMp_bkup(value);
		};

		actor.setMp_bkup = actor.setMp;
		actor.setMp = function(mp) {
			mp = this.mmp;
			this.setMp_bkup(mp);
		};

		actor.gainTp_bkup = actor.gainTp;
		actor.gainTp = function (value) {
			value = this.maxTp();
			this.gainTp_bkup(value);
		};

		actor.setTp_bkup = actor.setTp;
		actor.setTp = function(tp) {
			tp = this.maxTp();
			this.setTp_bkup(tp);
		};

		actor.paySkillCost_bkup = actor.paySkillCost;
		actor.paySkillCost = function (skill) {
			// do nothing
		};

		actor.god_mode_interval = setInterval(function() {
			actor.gainHp(actor.mhp);
			actor.gainMp(actor.mmp);
			actor.gainTp(actor.maxTp());
		}, 100);
	}
};


// disable god mode for an actor
Cheat_Menu.god_mode_off = function(actor) {
	if (actor instanceof Game_Actor && actor.god_mode) {
		actor.god_mode = false;

		actor.gainHp = actor.gainHP_bkup;
		actor.setHp = actor.setHp_bkup;
		actor.gainMp = actor.gainMp_bkup;
		actor.setMp = actor.setMp_bkup;
		actor.gainTp = actor.gainTp_bkup;
		actor.setTp = actor.setTp_bkup;
		actor.paySkillCost = actor.paySkillCost_bkup;

		clearInterval(actor.god_mode_interval);
	}
};

// set all party hp
Cheat_Menu.set_party_hp = function(hp, alive) {
	var members = $gameParty.allMembers();
	for (var i = 0; i < members.length; i++) {
		if ((alive && members[i]._hp != 0) || !alive) {
			members[i].setHp(hp);
		}
	}
};

// set all party mp
Cheat_Menu.set_party_mp = function(mp, alive) {
	var members = $gameParty.allMembers();
	for (var i = 0; i < members.length; i++) {
		if ((alive && members[i]._hp != 0) || !alive) {
			members[i].setMp(mp);
		}
	}
};

// set all party tp
Cheat_Menu.set_party_tp = function(tp, alive) {
	var members = $gameParty.allMembers();
	for (var i = 0; i < members.length; i++) {
		if ((alive && members[i]._hp != 0) || !alive) {
			members[i].setTp(tp);
		}
	}
};

// party full recover hp
Cheat_Menu.recover_party_hp = function(alive) {
	var members = $gameParty.allMembers();
	for (var i = 0; i < members.length; i++) {
		if ((alive && members[i]._hp != 0) || !alive) {
			members[i].setHp(members[i].mhp);
		}
	}
};

// party full recover mp
Cheat_Menu.recover_party_mp = function(alive) {
	var members = $gameParty.allMembers();
	for (var i = 0; i < members.length; i++) {
		if ((alive && members[i]._hp != 0) || !alive) {
			members[i].setMp(members[i].mmp);
		}
	}
};

// party max tp
Cheat_Menu.recover_party_tp = function(alive) {
	var members = $gameParty.allMembers();
	for (var i = 0; i < members.length; i++) {
		if ((alive && members[i]._hp != 0) || !alive) {
			members[i].setTp(members[i].maxTp());
		}
	}
};

// set all enemies hp
Cheat_Menu.set_enemy_hp = function(hp, alive) {
	var members = $gameTroop.members();
	for (var i = 0; i < members.length; i++) {
		if (members[i]) {
			if ((alive && members[i]._hp != 0) || !alive) {
				members[i].setHp(hp);
			}
		}
	}
    // RPG Maker may not run its normal battle-end check while the command
    // window remains active. Do it explicitly after a cheat defeats the troop.
    if ($gameParty.inBattle && $gameParty.inBattle() && $gameTroop.isAllDead && $gameTroop.isAllDead()) {
        Cheat_Menu.close_overlay();
        if (typeof BattleManager !== 'undefined' && BattleManager.checkBattleEnd) BattleManager.checkBattleEnd();
    }
};

// increase exp
Cheat_Menu.give_exp = function(actor, amount) {
	if (actor instanceof Game_Actor) {
		actor.gainExp(amount);
	}
};

// increase stat bonus
Cheat_Menu.give_stat = function(actor, stat_index, amount) {
	if (actor instanceof Game_Actor) {
		if (actor._paramPlus[stat_index] != undefined) {
			actor.addParam(stat_index, amount);
		}
	}
};

// increase gold
Cheat_Menu.give_gold = function(amount) {
	$gameParty.gainGold(amount);
};

// increase item count for party of item, by id
Cheat_Menu.give_item = function(item_id, amount) {
	if ($dataItems[item_id] != undefined) {
		$gameParty.gainItem($dataItems[item_id], amount);
	}
};

// increase weapon count for party of item, by id
Cheat_Menu.give_weapon = function(weapon_id, amount) {
	if ($dataWeapons[weapon_id] != undefined) {
		$gameParty.gainItem($dataWeapons[weapon_id], amount);
	}
};

// increase armor count for party of item, by id
Cheat_Menu.give_armor = function(armor_id, amount) {
	if ($dataArmors[armor_id] != undefined) {
		$gameParty.gainItem($dataArmors[armor_id], amount);
	}
};

// initialize speed hook for locking
Cheat_Menu.initialize_speed_lock = function() {
	if (!Cheat_Menu.speed_initialized) {
		Cheat_Menu.speed = $gamePlayer._moveSpeed;
		Object.defineProperty($gamePlayer, "_moveSpeed", {
			get: function() {return Cheat_Menu.speed;},
			set: function(newVal) {if(Cheat_Menu.speed_unlocked) {Cheat_Menu.speed = newVal;}}
		});
		Cheat_Menu.speed_initialized = true;
	}
};

// change player movement speed
Cheat_Menu.change_player_speed = function(amount) {
	Cheat_Menu.initialize_speed_lock();
	Cheat_Menu.speed += amount;
};

// toggle locking of player speed
Cheat_Menu.toggle_lock_player_speed = function(amount) {
	Cheat_Menu.initialize_speed_lock();
	Cheat_Menu.speed_unlocked = !Cheat_Menu.speed_unlocked;
};


// clear active states on an actor
Cheat_Menu.clear_actor_states = function(actor) {
	if (actor instanceof Game_Actor) {
		if (actor._states != undefined && actor._states.length > 0) {
			actor.clearStates();
		}
	}
};

// clear active states on party
Cheat_Menu.clear_party_states = function() {
	var members = $gameParty.allMembers();
	for (var i = 0; i < members.length; i++) {
		Cheat_Menu.clear_actor_states(members[i]);
	}
};

// change game variable value, by id
Cheat_Menu.set_variable = function(variable_id, value) {
	if ($dataSystem.variables[variable_id] != undefined) {
		var new_value = $gameVariables.value(variable_id) + value;
		$gameVariables.setValue(variable_id, new_value);
	}
};

// toggle game switch value, by id
Cheat_Menu.toggle_switch = function(switch_id) {
	if ($dataSystem.switches[switch_id] != undefined) {
		$gameSwitches.setValue(switch_id, !$gameSwitches.value(switch_id));
	}
};

// Change location by map id, and x, y position
Cheat_Menu.teleport = function(map_id, x_pos, y_pos) {
	$gamePlayer.reserveTransfer(map_id, x_pos, y_pos, $gamePlayer.direction(), 0);
	$gamePlayer.setPosition(x_pos, y_pos);
};

/////////////////////////////////////////////////
// Cheat Menu overlay
/////////////////////////////////////////////////

// HTML elements and some CSS for positioning
//	other css in in CSS file attached
Cheat_Menu.overlay_box = document.createElement('div');
Cheat_Menu.overlay_box.id = "cheat_menu";
Cheat_Menu.overlay_box.style.left = "5px";
Cheat_Menu.overlay_box.style.top = "5px";
Cheat_Menu.overlay_box.style.right = "";
Cheat_Menu.overlay_box.style.bottom = "";

Cheat_Menu.overlay = document.createElement('table');
Cheat_Menu.overlay.id = "cheat_menu_text";
Cheat_Menu.overlay.style.left = "5px";
Cheat_Menu.overlay.style.top = "5px";
Cheat_Menu.overlay.style.right = "";
Cheat_Menu.overlay.style.bottom = "";


// Attach other css for styling
Cheat_Menu.style_css = document.createElement("style");
Cheat_Menu.style_css.type = "text/css";
Cheat_Menu.style_css.textContent = '#cheat_menu{\n\tposition: absolute;\n\twidth: 280px;\n\theight: 100px;\n\tz-index: 1000;\n\tbackground-color: #000000;\n\tcolor: #ffffff;\n\topacity: 0.75;\n\ttext-align: center;\n\tpadding: 10px;\n}\n\n#cheat_menu_text{\n\tposition: absolute;\n\twidth: 300px;\n\tz-index: 1001;\n\tbackground-color: transparent;\n\tcolor: #ffffff;\n\topacity: 1;\n\ttext-align: center;\n\tpadding: 10px;\n\n\tborder-spacing: 0; \n}\n\n.scroll_selector_row {\n\twidth: 100%;\n\ttext-align: center;\n}\n\n.scroll_selector_buttons:hover {\n\tcolor: #ff0000;\n\ttext-shadow: 0 0 5px #ff0000;\n}\n\n.cheat_menu_buttons:hover {\n\tcolor: #ff0000;\n\ttext-shadow: 0 0 5px #ff0000;\n}\n\n.cheat_menu_cell {\n\tborder-bottom: 1px solid #6f6f6f;\n\tmax-width: 100px;\n\twidth: 100px;\n\n\tfont-weight: normal;\n\tfont-size: 15px;\n\tpadding-top: 5px;\n\tpadding-bottom: 5px;\n}\n\n.cheat_menu_cell_title {\n\tmax-width: 100px;\n\twidth: 100px;\n\tfont-weight: bold;\n\tfont-size: 20px;\n\tpadding-top: 8px;\n\tpadding-bottom: 5px;\n}';
document.head.appendChild(Cheat_Menu.style_css);


// keep menu in correct location
Cheat_Menu.position_menu = function(event) {
	//middle of screen
	if (Cheat_Menu.position == 0) {
		Cheat_Menu.overlay_box.style.left = "" + (window.innerWidth / 2) + "px";
		Cheat_Menu.overlay_box.style.top = "" + (window.innerHeight / 2) + "px";
		Cheat_Menu.overlay_box.style.right = "";
		Cheat_Menu.overlay_box.style.bottom = "";

		Cheat_Menu.overlay_box.style.marginLeft = "-110px";
		Cheat_Menu.overlay_box.style.marginTop = "-50px";

		Cheat_Menu.overlay.style.left = "" + (window.innerWidth / 2) + "px";
		Cheat_Menu.overlay.style.top = "" + (window.innerHeight / 2) + "px";
		Cheat_Menu.overlay.style.right = "";
		Cheat_Menu.overlay.style.bottom = "";

		Cheat_Menu.overlay.style.marginLeft = "-110px";
		Cheat_Menu.overlay.style.marginTop = "-50px";
	}
	// top left corner
	else if (Cheat_Menu.position == 1) {
		Cheat_Menu.overlay_box.style.left = "5px";
		Cheat_Menu.overlay_box.style.top = "5px";
		Cheat_Menu.overlay_box.style.right = "";
		Cheat_Menu.overlay_box.style.bottom = "";

		Cheat_Menu.overlay_box.style.marginLeft = "";
		Cheat_Menu.overlay_box.style.marginTop = "";

		Cheat_Menu.overlay.style.left = "5px";
		Cheat_Menu.overlay.style.top = "5px";
		Cheat_Menu.overlay.style.right = "";
		Cheat_Menu.overlay.style.bottom = "";

		Cheat_Menu.overlay.style.marginLeft = "";
		Cheat_Menu.overlay.style.marginTop = "";
	}
	// top right corner
	else if (Cheat_Menu.position == 2) {
		Cheat_Menu.overlay_box.style.left = "";
		Cheat_Menu.overlay_box.style.top = "5px";
		Cheat_Menu.overlay_box.style.right = "5px";
		Cheat_Menu.overlay_box.style.bottom = "";

		Cheat_Menu.overlay_box.style.marginLeft = "";
		Cheat_Menu.overlay_box.style.marginTop = "";

		Cheat_Menu.overlay.style.left = "";
		Cheat_Menu.overlay.style.top = "5px";
		Cheat_Menu.overlay.style.right = "-15px";
		Cheat_Menu.overlay.style.bottom = "";

		Cheat_Menu.overlay.style.marginLeft = "";
		Cheat_Menu.overlay.style.marginTop = "";
	}
	// bottom right corner
	else if (Cheat_Menu.position == 3) {
		Cheat_Menu.overlay_box.style.left = "";
		Cheat_Menu.overlay_box.style.top = "";
		Cheat_Menu.overlay_box.style.right = "5px";
		Cheat_Menu.overlay_box.style.bottom = "5px";

		Cheat_Menu.overlay_box.style.marginLeft = "";
		Cheat_Menu.overlay_box.style.marginTop = "";

		Cheat_Menu.overlay.style.left = "";
		Cheat_Menu.overlay.style.top = "";
		Cheat_Menu.overlay.style.right = "-15px";
		Cheat_Menu.overlay.style.bottom = "5px";

		Cheat_Menu.overlay.style.marginLeft = "";
		Cheat_Menu.overlay.style.marginTop = "";
	}
	// bottom left corner
	else if (Cheat_Menu.position == 4) {
		Cheat_Menu.overlay_box.style.left = "5px";
		Cheat_Menu.overlay_box.style.top = "";
		Cheat_Menu.overlay_box.style.right = "";
		Cheat_Menu.overlay_box.style.bottom = "5px";

		Cheat_Menu.overlay_box.style.marginLeft = "";
		Cheat_Menu.overlay_box.style.marginTop = "";

		Cheat_Menu.overlay.style.left = "5px";
		Cheat_Menu.overlay.style.top = "";
		Cheat_Menu.overlay.style.right = "";
		Cheat_Menu.overlay.style.bottom = "5px";

		Cheat_Menu.overlay.style.marginLeft = "";
		Cheat_Menu.overlay.style.marginTop = "";
	}
	
	// adjust background box size to match contents
	var height = 20;
	for (var i = 0; i < Cheat_Menu.overlay.children.length; i++) {
		height += Cheat_Menu.overlay.children[i].scrollHeight;
	}
	Cheat_Menu.overlay_box.style.height = "" + height + "px";
};

/////////////////////////////////////////////////
// Menu item types
/////////////////////////////////////////////////

// insert row with buttons to scroll left and right for some context
//	appears as:
//	<-[key1] text [key2]->
//	scrolling is handled by scroll_left_handler and scroll_right_handler functions
//	text: string 
//	key1,key2: key mapping
//	scroll_handler: single function that handles the left and right scroll arguments should be (direction, event)
Cheat_Menu.append_scroll_selector = function(text, key1, key2, scroll_handler) {
	var scroll_selector = Cheat_Menu.overlay.insertRow();
	scroll_selector.className = "scroll_selector_row";

	var scroll_left_button = scroll_selector.insertCell();
	scroll_left_button.className = "scroll_selector_buttons cheat_menu_cell";

	
	var scroll_text = scroll_selector.insertCell();
	scroll_text.className = "cheat_menu_cell";

	var scroll_right_button = scroll_selector.insertCell();
	scroll_right_button.className = "scroll_selector_buttons cheat_menu_cell";
	
	scroll_left_button.innerHTML = "←[" + key1 + "]";
	scroll_text.innerHTML = text;
	scroll_right_button.innerHTML =  "[" + key2 + "]→";

	scroll_left_button.addEventListener('mousedown', scroll_handler.bind(null, "left"));
	scroll_right_button.addEventListener('mousedown', scroll_handler.bind(null, "right"));

	Cheat_Menu.key_listeners[key1] = scroll_handler.bind(null, "left");
	Cheat_Menu.key_listeners[key2] = scroll_handler.bind(null, "right");
};

// Insert a title row
//	A row in the menu that is just text
//	title: string
Cheat_Menu.append_title = function(title) {
	var title_row = Cheat_Menu.overlay.insertRow();
	var temp = title_row.insertCell()
	temp.className = "cheat_menu_cell_title";
	var title_text = title_row.insertCell();
	title_text.className = "cheat_menu_cell_title";
	temp = title_row.insertCell()
	temp.className = "cheat_menu_cell_title";
	title_text.innerHTML = title;
};

// Insert a desciption row
//	A row in the menu that is just text (smaller than title)
//	text: string
Cheat_Menu.append_description = function(text) {
	var title_row = Cheat_Menu.overlay.insertRow();
	var temp = title_row.insertCell()
	temp.className = "cheat_menu_cell";
	var title_text = title_row.insertCell();
	title_text.className = "cheat_menu_cell";
	temp = title_row.insertCell()
	temp.className = "cheat_menu_cell";
	title_text.innerHTML = text;
};

// Append a cheat with some handler to activate
//	Appears as:
//	cheat text	status text[key]
//	cheat_text: string
//	status_text: string 
//	key: key mapping
//	click_handler: function
Cheat_Menu.append_cheat = function(cheat_text, status_text, key, click_handler) {
	var cheat_row = Cheat_Menu.overlay.insertRow();

	var cheat_title = cheat_row.insertCell();
	cheat_title.className = "cheat_menu_cell"
	var temp = cheat_row.insertCell()
	temp.className = "cheat_menu_cell";
	var cheat = cheat_row.insertCell();
	cheat.className = "cheat_menu_buttons cheat_menu_cell";

	cheat_title.innerHTML = cheat_text;
	cheat.innerHTML = status_text + "[" + key + "]";

	cheat.addEventListener('mousedown', click_handler);
	Cheat_Menu.key_listeners[key] = click_handler;
};

/////////////////////////////////////////////////////////////
// Various functions to settup each page of the cheat menu
/////////////////////////////////////////////////////////////


// Left and right scrollers for handling switching between menus
Cheat_Menu.scroll_cheat = function(direction, event) {
	if (direction == "left") {
		Cheat_Menu.cheat_selected--;
		if (Cheat_Menu.cheat_selected < 0) {
			Cheat_Menu.cheat_selected = Cheat_Menu.menus.length - 1;
		}
	}
	else {
		Cheat_Menu.cheat_selected++;
		if (Cheat_Menu.cheat_selected > Cheat_Menu.menus.length - 1) {
			Cheat_Menu.cheat_selected = 0;
		}
	}

	SoundManager.playSystemSound(0);
	Cheat_Menu.update_menu();
};

// Menu title with scroll options to go between menu, should be first
//	append on each menu
Cheat_Menu.append_cheat_title = function(cheat_name) {
	Cheat_Menu.append_title("Cheat");
	Cheat_Menu.append_scroll_selector(cheat_name, 2, 3, Cheat_Menu.scroll_cheat);
};

// Left and right scrollers for handling switching selected actors
Cheat_Menu.scroll_actor = function(direction, event) {
	if (direction == "left") {
		Cheat_Menu.cheat_selected_actor--;
		if (Cheat_Menu.cheat_selected_actor < 0) {
			Cheat_Menu.cheat_selected_actor = $gameActors._data.length - 1;
		}
	}
	else {
		Cheat_Menu.cheat_selected_actor++;
		if (Cheat_Menu.cheat_selected_actor >= $gameActors._data.length) {
			Cheat_Menu.cheat_selected_actor = 0;
		}
	}
	
	SoundManager.playSystemSound(0);
	Cheat_Menu.update_menu();
};

// Append actor selection to the menu
Cheat_Menu.append_actor_selection = function(key1, key2) {
	Cheat_Menu.append_title("Actor");

	var actor_name;

	if ($gameActors._data[Cheat_Menu.cheat_selected_actor] && $gameActors._data[Cheat_Menu.cheat_selected_actor]._name) {
		actor_name = "<font color='#0088ff'>" + $gameActors._data[Cheat_Menu.cheat_selected_actor]._name + "</font>";
	}
	else {
		actor_name = "<font color='#ff0000'>NULL</font>";
	}

	Cheat_Menu.append_scroll_selector(actor_name, key1, key2, Cheat_Menu.scroll_actor);
};

// Hanler for the god_mode cheat
Cheat_Menu.god_mode_toggle = function(event) {
	if ($gameActors._data[Cheat_Menu.cheat_selected_actor]) {
		if (!($gameActors._data[Cheat_Menu.cheat_selected_actor].god_mode)) {
			Cheat_Menu.god_mode($gameActors._data[Cheat_Menu.cheat_selected_actor]);
			SoundManager.playSystemSound(1);
		}
		else {
			Cheat_Menu.god_mode_off($gameActors._data[Cheat_Menu.cheat_selected_actor]);
			SoundManager.playSystemSound(2);
		}
		Cheat_Menu.update_menu();
	}
};

// Append the god_mode cheat to the menu
Cheat_Menu.append_godmode_status = function() {
	var status_text;
	if ($gameActors._data[Cheat_Menu.cheat_selected_actor] && $gameActors._data[Cheat_Menu.cheat_selected_actor].god_mode) {
		status_text = "<font color='#00ff00'>on</font>";
	}
	else {
		status_text = "<font color='#ff0000'>off</font>";
	}

	Cheat_Menu.append_cheat("Status:", status_text, 6, Cheat_Menu.god_mode_toggle);
};

// handler for the enemy hp to 0 cheat alive only
Cheat_Menu.enemy_hp_cheat_1 = function() {
	Cheat_Menu.set_enemy_hp(0, true);
	SoundManager.playSystemSound(1);
};

// handler for the enemy hp to 1 cheat alive only
Cheat_Menu.enemy_hp_cheat_2 = function() {
	Cheat_Menu.set_enemy_hp(1, true);
	SoundManager.playSystemSound(1);
};

// handler for the enemy hp to 0 cheat all
Cheat_Menu.enemy_hp_cheat_3 = function() {
	Cheat_Menu.set_enemy_hp(0, false);
	SoundManager.playSystemSound(1);
};

// handler for the enemy hp to 1 cheat all
Cheat_Menu.enemy_hp_cheat_4 = function() {
	Cheat_Menu.set_enemy_hp(1, false);
	SoundManager.playSystemSound(1);
};

// Append the enemy hp cheats to the menu
Cheat_Menu.append_enemy_cheats = function(key1, key2, key3, key4) {
	Cheat_Menu.append_title("Alive");
	Cheat_Menu.append_cheat("Enemy HP to 0", "Activate", key1, Cheat_Menu.enemy_hp_cheat_1);
	Cheat_Menu.append_cheat("Enemy HP to 1", "Activate", key2, Cheat_Menu.enemy_hp_cheat_2);
	Cheat_Menu.append_title("All");
	Cheat_Menu.append_cheat("Enemy HP to 0", "Activate", key3, Cheat_Menu.enemy_hp_cheat_3);
	Cheat_Menu.append_cheat("Enemy HP to 1", "Activate", key4, Cheat_Menu.enemy_hp_cheat_4);
};

// handler for the party hp cheat to 0 alive only
Cheat_Menu.party_hp_cheat_1 = function() {
	Cheat_Menu.set_party_hp(0, true);
	SoundManager.playSystemSound(1);
};

// handler for the party hp cheat to 1 alive only
Cheat_Menu.party_hp_cheat_2 = function() {
	Cheat_Menu.set_party_hp(1, true);
	SoundManager.playSystemSound(1);
};

// handler for the party hp cheat to full alive only
Cheat_Menu.party_hp_cheat_3 = function() {
	Cheat_Menu.recover_party_hp(true);
	SoundManager.playSystemSound(1);
};

// handler for the party hp cheat to 0 all
Cheat_Menu.party_hp_cheat_4 = function() {
	Cheat_Menu.set_party_hp(0, false);
	SoundManager.playSystemSound(1);
};

// handler for the party hp cheat to 1 all
Cheat_Menu.party_hp_cheat_5 = function() {
	Cheat_Menu.set_party_hp(1, false);
	SoundManager.playSystemSound(1);
};

// handler for the party hp cheat full all
Cheat_Menu.party_hp_cheat_6 = function() {
	Cheat_Menu.recover_party_hp(false);
	SoundManager.playSystemSound(1);
};


// append the party hp cheats
Cheat_Menu.append_hp_cheats = function(key1, key2, key3, key4, key5, key6) {
	Cheat_Menu.append_title("Alive");
	Cheat_Menu.append_cheat("Party HP to 0", "Activate", key1, Cheat_Menu.party_hp_cheat_1);
	Cheat_Menu.append_cheat("Party HP to 1", "Activate", key2, Cheat_Menu.party_hp_cheat_2);
	Cheat_Menu.append_cheat("Party Full HP", "Activate", key3, Cheat_Menu.party_hp_cheat_3);
	Cheat_Menu.append_title("All");
	Cheat_Menu.append_cheat("Party HP to 0", "Activate", key4, Cheat_Menu.party_hp_cheat_4);
	Cheat_Menu.append_cheat("Party HP to 1", "Activate", key5, Cheat_Menu.party_hp_cheat_5);
	Cheat_Menu.append_cheat("Party Full HP", "Activate", key6, Cheat_Menu.party_hp_cheat_6);
};

// handler for the party mp cheat to 0 alive only
Cheat_Menu.party_mp_cheat_1 = function() {
	Cheat_Menu.set_party_mp(0, true);
	SoundManager.playSystemSound(1);
};

// handler for the party mp cheat to 1 alive only
Cheat_Menu.party_mp_cheat_2 = function() {
	Cheat_Menu.set_party_mp(1, true);
	SoundManager.playSystemSound(1);
};

// handler for the party mp cheat to full alive only
Cheat_Menu.party_mp_cheat_3 = function() {
	Cheat_Menu.recover_party_mp(true);
	SoundManager.playSystemSound(1);
};

// handler for the party mp cheat to 0 all
Cheat_Menu.party_mp_cheat_4 = function() {
	Cheat_Menu.set_party_mp(0, false);
	SoundManager.playSystemSound(1);
};

// handler for the party mp cheat to 1 all
Cheat_Menu.party_mp_cheat_5 = function() {
	Cheat_Menu.set_party_mp(1, false);
	SoundManager.playSystemSound(1);
};

// handler for the party mp cheat full all
Cheat_Menu.party_mp_cheat_6 = function() {
	Cheat_Menu.recover_party_mp(false);
	SoundManager.playSystemSound(1);
};


// append the party mp cheats
Cheat_Menu.append_mp_cheats = function(key1, key2, key3, key4, key5, key6) {
	Cheat_Menu.append_title("Alive");
	Cheat_Menu.append_cheat("Party MP to 0", "Activate", key1, Cheat_Menu.party_mp_cheat_1);
	Cheat_Menu.append_cheat("Party MP to 1", "Activate", key2, Cheat_Menu.party_mp_cheat_2);
	Cheat_Menu.append_cheat("Party Full MP", "Activate", key3, Cheat_Menu.party_mp_cheat_3);
	Cheat_Menu.append_title("All");
	Cheat_Menu.append_cheat("Party MP to 0", "Activate", key4, Cheat_Menu.party_mp_cheat_4);
	Cheat_Menu.append_cheat("Party MP to 1", "Activate", key5, Cheat_Menu.party_mp_cheat_5);
	Cheat_Menu.append_cheat("Party Full MP", "Activate", key6, Cheat_Menu.party_mp_cheat_6);
};

// handler for the party tp cheat to 0 alive only
Cheat_Menu.party_tp_cheat_1 = function() {
	Cheat_Menu.set_party_tp(0, true);
	SoundManager.playSystemSound(1);
};

// handler for the party tp cheat to 1 alive only
Cheat_Menu.party_tp_cheat_2 = function() {
	Cheat_Menu.set_party_tp(1, true);
	SoundManager.playSystemSound(1);
};

// handler for the party tp cheat to full alive only
Cheat_Menu.party_tp_cheat_3 = function() {
	Cheat_Menu.recover_party_tp(true);
	SoundManager.playSystemSound(1);
};

// handler for the party tp cheat to 0 all
Cheat_Menu.party_tp_cheat_4 = function() {
	Cheat_Menu.set_party_tp(0, false);
	SoundManager.playSystemSound(1);
};

// handler for the party tp cheat to 1 all
Cheat_Menu.party_tp_cheat_5 = function() {
	Cheat_Menu.set_party_tp(1, false);
	SoundManager.playSystemSound(1);
};

// handler for the party tp cheat full all
Cheat_Menu.party_tp_cheat_6 = function() {
	Cheat_Menu.recover_party_tp(false);
	SoundManager.playSystemSound(1);
};


// append the party tp cheats
Cheat_Menu.append_tp_cheats = function(key1, key2, key3, key4, key5, key6) {
	Cheat_Menu.append_title("Alive");
	Cheat_Menu.append_cheat("Party TP to 0", "Activate", key1, Cheat_Menu.party_tp_cheat_1);
	Cheat_Menu.append_cheat("Party TP to 1", "Activate", key2, Cheat_Menu.party_tp_cheat_2);
	Cheat_Menu.append_cheat("Party Full TP", "Activate", key3, Cheat_Menu.party_tp_cheat_3);
	Cheat_Menu.append_title("All");
	Cheat_Menu.append_cheat("Party TP to 0", "Activate", key4, Cheat_Menu.party_tp_cheat_4);
	Cheat_Menu.append_cheat("Party TP to 1", "Activate", key5, Cheat_Menu.party_tp_cheat_5);
	Cheat_Menu.append_cheat("Party Full TP", "Activate", key6, Cheat_Menu.party_tp_cheat_6);
};

// handler for the toggle no clip cheat
Cheat_Menu.toggle_no_clip_status = function(event) {
	$gamePlayer._through = !($gamePlayer._through);
	Cheat_Menu.update_menu();
	if ($gamePlayer._through) {
		SoundManager.playSystemSound(1);
	}
	else {
		SoundManager.playSystemSound(2);
	}
};

// appen the no clip cheat
Cheat_Menu.append_no_clip_status = function(key1) {
	var status_text;
	if ($gamePlayer._through) {
		status_text = "<font color='#00ff00'>on</font>";
	}
	else {
		status_text = "<font color='#ff0000'>off</font>";
	}

	Cheat_Menu.append_cheat("Status:", status_text, key1, Cheat_Menu.toggle_no_clip_status);
};

// Left and right scrollers for handling switching amount to modify numerical cheats
Cheat_Menu.scroll_amount = function(direction, event) {
	if (direction == "left") {
		Cheat_Menu.amount_index--;
		if (Cheat_Menu.amount_index < 0) {
			Cheat_Menu.amount_index = 0;
		}
		SoundManager.playSystemSound(2);
	}
	else {
		Cheat_Menu.amount_index++;
		if (Cheat_Menu.amount_index >= Cheat_Menu.amounts.length) {
			Cheat_Menu.amount_index = Cheat_Menu.amounts.length - 1;
		}
		SoundManager.playSystemSound(1);
	}
	
	Cheat_Menu.update_menu();
};

// append the amount selection to the menu
Cheat_Menu.append_amount_selection = function(key1, key2) {
	Cheat_Menu.append_title("Amount");

	var current_amount = "<font color='#0088ff'>" + Cheat_Menu.amounts[Cheat_Menu.amount_index] + "</font>";
	Cheat_Menu.append_scroll_selector(current_amount, key1, key2, Cheat_Menu.scroll_amount);
};

// Left and right scrollers for handling switching amount to modify for the movement cheat
Cheat_Menu.scroll_move_amount = function(direction, event) {
	if (direction == "left") {
		Cheat_Menu.move_amount_index--;
		if (Cheat_Menu.move_amount_index < 0) {
			Cheat_Menu.move_amount_index = 0;
		}
		SoundManager.playSystemSound(2);
	}
	else {
		Cheat_Menu.move_amount_index++;
		if (Cheat_Menu.move_amount_index >= Cheat_Menu.move_amounts.length) {
			Cheat_Menu.move_amount_index = Cheat_Menu.move_amounts.length - 1;
		}
		SoundManager.playSystemSound(1);
	}
	
	Cheat_Menu.update_menu();
};

// append the movement speed amount to the menu
Cheat_Menu.append_move_amount_selection = function(key1, key2) {
	Cheat_Menu.append_title("Amount");

	var current_amount = "<font color='#0088ff'>" + Cheat_Menu.move_amounts[Cheat_Menu.move_amount_index] + "</font>";
	Cheat_Menu.append_scroll_selector(current_amount, key1, key2, Cheat_Menu.scroll_move_amount);
};

// handlers for the exp cheat
Cheat_Menu.apply_current_exp = function(direction, event) {
	var amount = Cheat_Menu.amounts[Cheat_Menu.amount_index];
	if (direction == "left") {
		amount = -amount;
		SoundManager.playSystemSound(2);
	}
	else {
		SoundManager.playSystemSound(1);
	}
	Cheat_Menu.give_exp($gameActors._data[Cheat_Menu.cheat_selected_actor], amount);
	Cheat_Menu.update_menu();
};

// append the exp cheat to the menu
Cheat_Menu.append_exp_cheat = function(key1, key2) {
	var current_exp = "NULL";
	if ($gameActors._data[Cheat_Menu.cheat_selected_actor]) {
		current_exp = $gameActors._data[Cheat_Menu.cheat_selected_actor].currentExp();
	}
	Cheat_Menu.append_title("EXP");
	Cheat_Menu.append_scroll_selector(current_exp, key1, key2, Cheat_Menu.apply_current_exp);
};

// Left and right scrollers for handling switching between stats for the selected character
Cheat_Menu.scroll_stat = function(direction, event) {
	if ($gameActors._data[Cheat_Menu.cheat_selected_actor] && $gameActors._data[Cheat_Menu.cheat_selected_actor]._paramPlus) {
		if (direction == "left") {
			Cheat_Menu.stat_selection--;
			if (Cheat_Menu.stat_selection < 0) {
				Cheat_Menu.stat_selection = $gameActors._data[Cheat_Menu.cheat_selected_actor]._paramPlus.length - 1;
			}
		}
		else {
			Cheat_Menu.stat_selection++;
			if (Cheat_Menu.stat_selection >= $gameActors._data[Cheat_Menu.cheat_selected_actor]._paramPlus.length) {
				Cheat_Menu.stat_selection = 0;
			}
		}
	}
	else {
		Cheat_Menu.stat_selection = 0;
	}
	SoundManager.playSystemSound(0);
	Cheat_Menu.update_menu();
};

// handlers for the stat cheat
Cheat_Menu.apply_current_stat = function(direction, event) {
	var amount = Cheat_Menu.amounts[Cheat_Menu.amount_index];
	if (direction == "left") {
		amount = -amount;
		SoundManager.playSystemSound(2);
	}
	else {
		SoundManager.playSystemSound(1);
	}
	Cheat_Menu.give_stat($gameActors._data[Cheat_Menu.cheat_selected_actor], Cheat_Menu.stat_selection , amount);
	Cheat_Menu.update_menu();
};


// append the stat selection to the menu
Cheat_Menu.append_stat_selection = function(key1, key2, key3, key4) {
	Cheat_Menu.append_title("Stat");

	var stat_string = "";

	var stat_string = "";
	if ($gameActors._data[Cheat_Menu.cheat_selected_actor] && $gameActors._data[Cheat_Menu.cheat_selected_actor]._paramPlus) {
		if (Cheat_Menu.stat_selection >= $gameActors._data[Cheat_Menu.cheat_selected_actor]._paramPlus.length) {
			Cheat_Menu.stat_selection = 0;
		}
		stat_string += $dataSystem.terms.params[Cheat_Menu.stat_selection];
	}

	Cheat_Menu.append_scroll_selector(stat_string, key1, key2, Cheat_Menu.scroll_stat);
	var current_value = "NULL";
	if ($gameActors._data[Cheat_Menu.cheat_selected_actor] && $gameActors._data[Cheat_Menu.cheat_selected_actor]._paramPlus) {
		current_value = $gameActors._data[Cheat_Menu.cheat_selected_actor]._paramPlus[Cheat_Menu.stat_selection];
	}
	Cheat_Menu.append_scroll_selector(current_value, key3, key4, Cheat_Menu.apply_current_stat);
};

// handlers for the gold cheat
Cheat_Menu.apply_current_gold = function(direction, event) {
	var amount = Cheat_Menu.amounts[Cheat_Menu.amount_index];
	if (direction == "left") {
		amount = -amount;
		SoundManager.playSystemSound(2);
	}
	else {
		SoundManager.playSystemSound(1);
	}
	Cheat_Menu.give_gold(amount);
	Cheat_Menu.update_menu();
};

// append the gold cheat to the menu
Cheat_Menu.append_gold_status = function(key1, key2) {
	Cheat_Menu.append_title("Gold");
	Cheat_Menu.append_scroll_selector($gameParty._gold, key1, key2, Cheat_Menu.apply_current_gold);
};

// handler for the movement speed cheat
Cheat_Menu.apply_speed_change = function(direction, event) {
	var amount = Cheat_Menu.move_amounts[Cheat_Menu.move_amount_index];
	if (direction == "left") {
		amount = -amount;
		SoundManager.playSystemSound(2);
	}
	else {
		SoundManager.playSystemSound(1);
	}
	Cheat_Menu.change_player_speed(amount);
	Cheat_Menu.update_menu();
};

Cheat_Menu.apply_speed_lock_toggle = function() {
	Cheat_Menu.toggle_lock_player_speed();
	if (Cheat_Menu.speed_unlocked) {
		SoundManager.playSystemSound(2);
	}
	else {
		SoundManager.playSystemSound(1);
	}
	Cheat_Menu.update_menu();
};

// append the movement speed to the menu
Cheat_Menu.append_speed_status = function(key1, key2, key3) {
	Cheat_Menu.append_title("Current Speed");
	Cheat_Menu.append_scroll_selector($gamePlayer._moveSpeed, key1, key2, Cheat_Menu.apply_speed_change);
	var status_text;
	if (!Cheat_Menu.speed_unlocked) {
		status_text = "<font color='#00ff00'>false</font>";
	}
	else {
		status_text = "<font color='#ff0000'>true</font>";
	}
	Cheat_Menu.append_cheat("Speed Unlocked", status_text, key3, Cheat_Menu.apply_speed_lock_toggle);
};

// Left and right scrollers for handling switching between items selected
Cheat_Menu.scroll_item = function(direction, event) {
	if (direction == "left") {
		Cheat_Menu.item_selection--;
		if (Cheat_Menu.item_selection < 0) {
			Cheat_Menu.item_selection = $dataItems.length - 1;
		}
	}
	else {
		Cheat_Menu.item_selection++;
		if (Cheat_Menu.item_selection >= $dataItems.length) {
			Cheat_Menu.item_selection = 0;
		}
	}
	SoundManager.playSystemSound(0);
	Cheat_Menu.update_menu();
};

// handlers for the item cheat
Cheat_Menu.apply_current_item = function(direction, event) {
	var amount = Cheat_Menu.amounts[Cheat_Menu.amount_index];
	if (direction == "left") {
		amount = -amount;
		SoundManager.playSystemSound(2);
	}
	else {
		SoundManager.playSystemSound(1);
	}
	Cheat_Menu.give_item(Cheat_Menu.item_selection, amount);
	Cheat_Menu.update_menu();
};

// append the item cheat to the menu
Cheat_Menu.append_item_selection = function(key1, key2, key3, key4) {
	Cheat_Menu.append_title("Item");
	var current_item = "";
	if ($dataItems[Cheat_Menu.item_selection] && $dataItems[Cheat_Menu.item_selection].name && $dataItems[Cheat_Menu.item_selection].name.length > 0) {
		current_item = $dataItems[Cheat_Menu.item_selection].name;
	}
	else {
		current_item = "NULL";
	}

	Cheat_Menu.append_scroll_selector(current_item, key1, key2, Cheat_Menu.scroll_item);
	var current_item_amount = 0;
	if ($gameParty._items[Cheat_Menu.item_selection] != undefined) {
		current_item_amount = $gameParty._items[Cheat_Menu.item_selection];
	}
	Cheat_Menu.append_scroll_selector(current_item_amount, key3, key4, Cheat_Menu.apply_current_item);
};

// Left and right scrollers for handling switching between weapon selected
Cheat_Menu.scroll_weapon = function(direction, event) {
	if (direction == "left") {
		Cheat_Menu.weapon_selection--;
		if (Cheat_Menu.weapon_selection < 0) {
			Cheat_Menu.weapon_selection = $dataWeapons.length - 1;
		}
	}
	else {
		Cheat_Menu.weapon_selection++;
		if (Cheat_Menu.weapon_selection >= $dataWeapons.length) {
			Cheat_Menu.weapon_selection = 0;
		}
	}
	SoundManager.playSystemSound(0);
	
	Cheat_Menu.update_menu();
};

// handlers for the weapon cheat
Cheat_Menu.apply_current_weapon = function(direction, event) {
	var amount = Cheat_Menu.amounts[Cheat_Menu.amount_index];
	if (direction == "left") {
		amount = -amount;
		SoundManager.playSystemSound(2);
	}
	else {
		SoundManager.playSystemSound(1);
	}
	Cheat_Menu.give_weapon(Cheat_Menu.weapon_selection, amount);
	Cheat_Menu.update_menu();
};

// append the weapon cheat to the menu
Cheat_Menu.append_weapon_selection = function(key1, key2, key3, key4) {
	Cheat_Menu.append_title("Weapon");
	var current_weapon = "";
	if ($dataWeapons[Cheat_Menu.weapon_selection] && $dataWeapons[Cheat_Menu.weapon_selection].name && $dataWeapons[Cheat_Menu.weapon_selection].name.length > 0) {
		current_weapon = $dataWeapons[Cheat_Menu.weapon_selection].name;
	}
	else {
		current_weapon = "NULL";
	}

	Cheat_Menu.append_scroll_selector(current_weapon, key1, key2, Cheat_Menu.scroll_weapon);
	var current_weapon_amount = 0;
	if ($gameParty._weapons[Cheat_Menu.weapon_selection] != undefined) {
		current_weapon_amount = $gameParty._weapons[Cheat_Menu.weapon_selection];
	}
	Cheat_Menu.append_scroll_selector(current_weapon_amount, key3, key4, Cheat_Menu.apply_current_weapon);
};

// Left and right scrollers for handling switching between armor selected
Cheat_Menu.scroll_armor = function(direction, event) {
	if (direction == "left") {
		Cheat_Menu.armor_selection--;
		if (Cheat_Menu.armor_selection < 0) {
			Cheat_Menu.armor_selection = $dataArmors.length - 1;
		}
	}
	else {
		Cheat_Menu.armor_selection++;
		if (Cheat_Menu.armor_selection >= $dataArmors.length) {
			Cheat_Menu.armor_selection = 0;
		}
	}
	SoundManager.playSystemSound(0);
	
	Cheat_Menu.update_menu();
};

// handler for the armor cheat
Cheat_Menu.apply_current_armor = function(direction, event) {
	var amount = Cheat_Menu.amounts[Cheat_Menu.amount_index];
	if (direction == "left") {
		amount = -amount;
		SoundManager.playSystemSound(2);
	}
	else {
		SoundManager.playSystemSound(1);
	}
	Cheat_Menu.give_armor(Cheat_Menu.armor_selection, amount);
	Cheat_Menu.update_menu();
};

// append the armor cheat to the menu
Cheat_Menu.append_armor_selection = function(key1, key2, key3, key4) {
	Cheat_Menu.append_title("Armor");
	var current_armor = "";
	if ($dataArmors[Cheat_Menu.armor_selection] && $dataArmors[Cheat_Menu.armor_selection].name && $dataArmors[Cheat_Menu.armor_selection].name.length > 0) {
		current_armor = $dataArmors[Cheat_Menu.armor_selection].name;
	}
	else {
		current_armor = "NULL";
	}

	Cheat_Menu.append_scroll_selector(current_armor, key1, key2, Cheat_Menu.scroll_armor);
	var current_armor_amount = 0;
	if ($gameParty._armors[Cheat_Menu.armor_selection] != undefined) {
		current_armor_amount = $gameParty._armors[Cheat_Menu.armor_selection];
	}
	Cheat_Menu.append_scroll_selector(current_armor_amount, key3, key4, Cheat_Menu.apply_current_armor);
};

// handler for the clear actor state cheat
Cheat_Menu.clear_current_actor_states = function() {
	Cheat_Menu.clear_actor_states($gameActors._data[Cheat_Menu.cheat_selected_actor]);
	SoundManager.playSystemSound(1);
	Cheat_Menu.update_menu();
};

// handler for the party state clear cheat
Cheat_Menu.party_clear_states_cheat = function() {
	Cheat_Menu.clear_party_states();
	SoundManager.playSystemSound(1);
};

// append the party hp cheats
Cheat_Menu.append_party_state = function(key1) {
	Cheat_Menu.append_cheat("Clear Party States", "Activate", key1, Cheat_Menu.party_clear_states_cheat);
};

// append the clear actor state cheat to the menu
Cheat_Menu.append_current_state = function(key1) {
	Cheat_Menu.append_title("Current State");
	var number_states = 0;

	if ($gameActors._data[Cheat_Menu.cheat_selected_actor] && $gameActors._data[Cheat_Menu.cheat_selected_actor]._states && $gameActors._data[Cheat_Menu.cheat_selected_actor]._states.length >= 0) {
		number_states = $gameActors._data[Cheat_Menu.cheat_selected_actor]._states.length;
	}
	else {
		number_states = null;
	}

	Cheat_Menu.append_cheat("Number Effects:", number_states, key1, Cheat_Menu.clear_current_actor_states);
};

// Left and right scrollers for handling switching between selected variable
Cheat_Menu.scroll_variable = function(direction, event) {
	if (direction == "left") {
		Cheat_Menu.variable_selection--;
		if (Cheat_Menu.variable_selection < 0) {
			Cheat_Menu.variable_selection = $dataSystem.variables.length - 1;
		}
	}
	else {
		Cheat_Menu.variable_selection++;
		if (Cheat_Menu.variable_selection >= $dataSystem.variables.length) {
			Cheat_Menu.variable_selection = 0;
		}
	}
	SoundManager.playSystemSound(0);
	Cheat_Menu.update_menu();
};

// handlers for the setting the current variable
Cheat_Menu.apply_current_variable = function(direction, event) {
	var amount = Cheat_Menu.amounts[Cheat_Menu.amount_index];
	if (direction == "left") {
		amount = -amount;
		SoundManager.playSystemSound(2);
	}
	else {
		SoundManager.playSystemSound(1);
	}
	Cheat_Menu.set_variable(Cheat_Menu.variable_selection, amount);
	Cheat_Menu.update_menu();
};

// append the variable cheat to the menu
Cheat_Menu.append_variable_selection = function(key1, key2, key3, key4) {
	Cheat_Menu.append_title("Variable");
	var current_variable = "";
	if ($dataSystem.variables[Cheat_Menu.variable_selection] && $dataSystem.variables[Cheat_Menu.variable_selection].length > 0) {
		current_variable = $dataSystem.variables[Cheat_Menu.variable_selection];
	}
	else {
		current_variable = "NULL";
	}

	Cheat_Menu.append_scroll_selector(current_variable, key1, key2, Cheat_Menu.scroll_variable);
	var current_variable_value = 'NULL';
	if ($gameVariables.value(Cheat_Menu.variable_selection) != undefined) {
		current_variable_value = $gameVariables.value(Cheat_Menu.variable_selection);
	}
	Cheat_Menu.append_scroll_selector(current_variable_value, key3, key4, Cheat_Menu.apply_current_variable);
};

// Left and right scrollers for handling switching between selected switch
Cheat_Menu.scroll_switch = function(direction, event) {
	if (direction == "left") {
		Cheat_Menu.switch_selection--;
		if (Cheat_Menu.switch_selection < 0) {
			Cheat_Menu.switch_selection = $dataSystem.switches.length - 1;
		}
	}
	else {
		Cheat_Menu.switch_selection++;
		if (Cheat_Menu.switch_selection >= $dataSystem.switches.length) {
			Cheat_Menu.switch_selection = 0;
		}
	}
	SoundManager.playSystemSound(0);
	Cheat_Menu.update_menu();
};

// handler for the toggling the current switch
Cheat_Menu.toggle_current_switch = function(event) {
	Cheat_Menu.toggle_switch(Cheat_Menu.switch_selection);
	if ($gameSwitches.value(Cheat_Menu.switch_selection)) {
		SoundManager.playSystemSound(1);
	}
	else {
		SoundManager.playSystemSound(2);
	}
	Cheat_Menu.update_menu();
};

// append the switch cheat to the menu
Cheat_Menu.append_switch_selection = function(key1, key2, key3) {
	Cheat_Menu.append_title("Switch");
	var current_switch = "";
	if ($dataSystem.switches[Cheat_Menu.switch_selection] && $dataSystem.switches[Cheat_Menu.switch_selection].length > 0) {
		current_switch = $dataSystem.switches[Cheat_Menu.switch_selection];
	}
	else {
		current_switch = "NULL";
	}

	Cheat_Menu.append_scroll_selector(current_switch, key1, key2, Cheat_Menu.scroll_switch);
	var current_switch_value = 'NULL';
	if ($gameSwitches.value(Cheat_Menu.switch_selection) != undefined) {
		current_switch_value = $gameSwitches.value(Cheat_Menu.switch_selection);
	}
	Cheat_Menu.append_cheat("Status:", current_switch_value, key3, Cheat_Menu.toggle_current_switch);
};

// handler for saving positions
Cheat_Menu.save_position = function(pos_num, event) {
	Cheat_Menu.saved_positions[pos_num].m = $gameMap.mapId();
	Cheat_Menu.saved_positions[pos_num].x = $gamePlayer.x;
	Cheat_Menu.saved_positions[pos_num].y = $gamePlayer.y;

	SoundManager.playSystemSound(1);
	Cheat_Menu.update_menu();
};

// handler for loading/recalling positions
Cheat_Menu.recall_position = function(pos_num, event) {
	if (Cheat_Menu.saved_positions[pos_num].m != -1) {
		Cheat_Menu.teleport(Cheat_Menu.saved_positions[pos_num].m, Cheat_Menu.saved_positions[pos_num].x, Cheat_Menu.saved_positions[pos_num].y);
		SoundManager.playSystemSound(1);
	}
	else {
		SoundManager.playSystemSound(2);
	}
	Cheat_Menu.update_menu();
};

// append the save/recall cheat to the menu
Cheat_Menu.append_save_recall = function (key1, key2, key3, key4, key5, key6) {
	
	Cheat_Menu.append_title("Current Position: ");

	if ($dataMapInfos[$gameMap.mapId()] && $dataMapInfos[$gameMap.mapId()].name) {
		var current_map = "" + $gameMap.mapId() + ": " + $dataMapInfos[$gameMap.mapId()].name;
		Cheat_Menu.append_description(current_map);

		var map_pos = "(" + $gamePlayer.x + ", " + $gamePlayer.y + ")";
		Cheat_Menu.append_description(map_pos);
	}
	else {
		Cheat_Menu.append_description("NULL");
	}

	var cur_key = 1;
	for (var i = 0; i < Cheat_Menu.saved_positions.length; i++) {
		Cheat_Menu.append_title("Position " + (i+1));

		var map_text;
		var pos_text;
		if (Cheat_Menu.saved_positions[i].m != -1) {
			map_text = "" + Cheat_Menu.saved_positions[i].m + ": ";
			if($dataMapInfos[Cheat_Menu.saved_positions[i].m].name) {
				map_text += $dataMapInfos[Cheat_Menu.saved_positions[i].m].name;
			}
			else {
				map_text += "NULL";
			}
			pos_text = "(" + Cheat_Menu.saved_positions[i].x + ", " + Cheat_Menu.saved_positions[i].y + ")";
		} 
		else {
			map_text = "NULL";
			pos_text = "NULL"
		}

		Cheat_Menu.append_cheat("Save:", map_text, eval("key" + cur_key), Cheat_Menu.save_position.bind(null, i));
		cur_key++;

		Cheat_Menu.append_cheat("Recall:", pos_text, eval("key" + cur_key), Cheat_Menu.recall_position.bind(null, i));
		cur_key++;
	}
};

// Left and right scrollers for handling switching between target teleport map
Cheat_Menu.scroll_map_teleport_selection = function(direction, event) {
	if (direction == "left") {
		Cheat_Menu.teleport_location.m--;
		if (Cheat_Menu.teleport_location.m < 1) {
			Cheat_Menu.teleport_location.m = $dataMapInfos.length - 1;
		}
	}
	else {
		Cheat_Menu.teleport_location.m++;
		if (Cheat_Menu.teleport_location.m >= $dataMapInfos.length) {
			Cheat_Menu.teleport_location.m = 1;
		}
	}

	SoundManager.playSystemSound(0);
	Cheat_Menu.update_menu();
};

// Left and right scrollers for handling switching between target teleport x coord
Cheat_Menu.scroll_x_teleport_selection = function(direction, event) {
	if (direction == "left") {
		Cheat_Menu.teleport_location.x--;
		if (Cheat_Menu.teleport_location.x < 0) {
			Cheat_Menu.teleport_location.x = 255;
		}
	}
	else {
		Cheat_Menu.teleport_location.x++;
		if (Cheat_Menu.teleport_location.x > 255) {
			Cheat_Menu.teleport_location.x = 0;
		}
	}

	SoundManager.playSystemSound(0);
	Cheat_Menu.update_menu();
};

// Left and right scrollers for handling switching between target teleport y coord
Cheat_Menu.scroll_y_teleport_selection = function(direction, event) {
	if (direction == "left") {
		Cheat_Menu.teleport_location.y--;
		if (Cheat_Menu.teleport_location.y < 0) {
			Cheat_Menu.teleport_location.y = 255;
		}
	}
	else {
		Cheat_Menu.teleport_location.y++;
		if (Cheat_Menu.teleport_location.y > 255) {
			Cheat_Menu.teleport_location.y = 0;
		}
	}

	SoundManager.playSystemSound(0);
	Cheat_Menu.update_menu();
};

// handler for teleporting to targed map and location
Cheat_Menu.teleport_current_location = function(event) {
	Cheat_Menu.teleport(Cheat_Menu.teleport_location.m, Cheat_Menu.teleport_location.x, Cheat_Menu.teleport_location.y);
	SoundManager.playSystemSound(1);
	Cheat_Menu.update_menu();
};

// append the teleport cheat to the menu
Cheat_Menu.append_teleport = function (key1, key2, key3, key4, key5, key6, key7) {
	var current_map = "" + Cheat_Menu.teleport_location.m + ": ";

	if ($dataMapInfos[Cheat_Menu.teleport_location.m] && $dataMapInfos[Cheat_Menu.teleport_location.m].name) {
		current_map += $dataMapInfos[Cheat_Menu.teleport_location.m].name;
	}
	else {
		current_map += "NULL";
	}

	Cheat_Menu.append_scroll_selector(current_map, key1, key2, Cheat_Menu.scroll_map_teleport_selection);

	Cheat_Menu.append_scroll_selector("X: " + Cheat_Menu.teleport_location.x, key3, key4, Cheat_Menu.scroll_x_teleport_selection);

	Cheat_Menu.append_scroll_selector("Y: " + Cheat_Menu.teleport_location.y, key5, key6, Cheat_Menu.scroll_y_teleport_selection);

	Cheat_Menu.append_cheat("Teleport", "Activate", key7, Cheat_Menu.teleport_current_location);
};


//////////////////////////////////////////////////////////////////////////////////
// Final Functions for building each Menu and function list for updating the menu
//////////////////////////////////////////////////////////////////////////////////
// Check if already defined (allows game specific extensions to be loaded in any order)
if (typeof Cheat_Menu.menus == "undefined") { Cheat_Menu.menus = []; }

// One menu added for each cheat/page of the Cheat_Menu
//	appended in reverse order at the front so they will
//	appear first no matter the plugin load order for any
//	extension plugins

Cheat_Menu.menus.splice(0, 0, function() {
	Cheat_Menu.append_cheat_title("Teleport");
	Cheat_Menu.append_teleport(4, 5, 6, 7, 8, 9, 0);
});

Cheat_Menu.menus.splice(0, 0, function() {
	Cheat_Menu.append_cheat_title("Save and Recall");
	Cheat_Menu.append_save_recall(4, 5, 6, 7, 8, 9);
});

Cheat_Menu.menus.splice(0, 0, function() {
	Cheat_Menu.append_cheat_title("Switches");
	Cheat_Menu.append_switch_selection(4, 5, 6);
});

Cheat_Menu.menus.splice(0, 0, function() {
	Cheat_Menu.append_cheat_title("Variables");
	Cheat_Menu.append_amount_selection(4, 5);
	Cheat_Menu.append_variable_selection(6, 7, 8, 9);
});

Cheat_Menu.menus.splice(0, 0, function() {
	Cheat_Menu.append_cheat_title("Clear States");
	Cheat_Menu.append_party_state(4);
	Cheat_Menu.append_actor_selection(5, 6);
	Cheat_Menu.append_current_state(7);
});

Cheat_Menu.menus.splice(0, 0, function() {
	Cheat_Menu.append_cheat_title("Speed");
	Cheat_Menu.append_move_amount_selection(4, 5);
	Cheat_Menu.append_speed_status(6, 7, 8);
});

Cheat_Menu.menus.splice(0, 0, function() {
	Cheat_Menu.append_cheat_title("Armors");
	Cheat_Menu.append_amount_selection(4, 5);
	Cheat_Menu.append_armor_selection(6, 7, 8, 9);
});

Cheat_Menu.menus.splice(0, 0, function() {
	Cheat_Menu.append_cheat_title("Weapons");
	Cheat_Menu.append_amount_selection(4, 5);
	Cheat_Menu.append_weapon_selection(6, 7, 8, 9);
});

Cheat_Menu.menus.splice(0, 0, function() {
	Cheat_Menu.append_cheat_title("Items");
	Cheat_Menu.append_amount_selection(4, 5);
	Cheat_Menu.append_item_selection(6, 7, 8, 9);
});

Cheat_Menu.menus.splice(0, 0, function() {
	Cheat_Menu.append_cheat_title("Gold");
	Cheat_Menu.append_amount_selection(4, 5);
	Cheat_Menu.append_gold_status(6, 7);
});

Cheat_Menu.menus.splice(0, 0, function() {
	Cheat_Menu.append_cheat_title("Stats");
	Cheat_Menu.append_actor_selection(4, 5);
	Cheat_Menu.append_amount_selection(6, 7);
	Cheat_Menu.append_stat_selection(8, 9, 0, '-');
});

Cheat_Menu.menus.splice(0, 0, function() {
	Cheat_Menu.append_cheat_title("Give Exp");
	Cheat_Menu.append_actor_selection(4, 5);
	Cheat_Menu.append_amount_selection(6, 7);
	Cheat_Menu.append_exp_cheat(8, 9);
});

Cheat_Menu.menus.splice(0, 0, function() {
	Cheat_Menu.append_cheat_title("Party TP");

	Cheat_Menu.append_tp_cheats(4, 5, 6, 7, 8, 9);
});

Cheat_Menu.menus.splice(0, 0, function() {
	Cheat_Menu.append_cheat_title("Party MP");

	Cheat_Menu.append_mp_cheats(4, 5, 6, 7, 8, 9);
});

Cheat_Menu.menus.splice(0, 0, function() {
	Cheat_Menu.append_cheat_title("Party HP");

	Cheat_Menu.append_hp_cheats(4, 5, 6, 7, 8, 9);
});

Cheat_Menu.menus.splice(0, 0, function() {
	Cheat_Menu.append_cheat_title("Enemy HP");

	Cheat_Menu.append_enemy_cheats(4, 5, 6, 7);
});

Cheat_Menu.menus.splice(0, 0, function() {
	Cheat_Menu.append_cheat_title("No Clip");

	Cheat_Menu.append_no_clip_status(4);
});

Cheat_Menu.menus.splice(0, 0, function() {
	Cheat_Menu.append_cheat_title("God Mode");
	Cheat_Menu.append_actor_selection(4, 5);

	Cheat_Menu.append_godmode_status();
});


// update whats being displayed in menu
Cheat_Menu.update_menu = function() {
	// clear menu
	Cheat_Menu.overlay.innerHTML = "";
	// clear key listeners
	Cheat_Menu.key_listeners = {};

	Cheat_Menu.menus[Cheat_Menu.cheat_selected]();

	Cheat_Menu.position_menu();
};

// listener to reposition menu
window.addEventListener("resize", Cheat_Menu.position_menu);


// prevent clicking from passing through
Cheat_Menu.overlay.addEventListener("mousedown", function(event) {
	event.stopPropagation();
});



/////////////////////////////////////////////////
// Cheat Menu Key Listener
/////////////////////////////////////////////////

// Key codes
if (typeof Cheat_Menu.keyCodes == "undefined") { Cheat_Menu.keyCodes = {}; }

Cheat_Menu.keyCodes.KEYCODE_0 = {keyCode: 48, key_listener: 0};
Cheat_Menu.keyCodes.KEYCODE_1 = {keyCode: 49, key_listener: 1};
Cheat_Menu.keyCodes.KEYCODE_2 = {keyCode: 50, key_listener: 2};
Cheat_Menu.keyCodes.KEYCODE_3 = {keyCode: 51, key_listener: 3};
Cheat_Menu.keyCodes.KEYCODE_4 = {keyCode: 52, key_listener: 4};
Cheat_Menu.keyCodes.KEYCODE_5 = {keyCode: 53, key_listener: 5};
Cheat_Menu.keyCodes.KEYCODE_6 = {keyCode: 54, key_listener: 6};
Cheat_Menu.keyCodes.KEYCODE_7 = {keyCode: 55, key_listener: 7};
Cheat_Menu.keyCodes.KEYCODE_8 = {keyCode: 56, key_listener: 8};
Cheat_Menu.keyCodes.KEYCODE_9 = {keyCode: 57, key_listener: 9};
Cheat_Menu.keyCodes.KEYCODE_MINUS = {keyCode: 189, key_listener: '-'};
Cheat_Menu.keyCodes.KEYCODE_EQUAL = {keyCode: 187, key_listener: '='};

Cheat_Menu.keyCodes.KEYCODE_TILDE = {keyCode: 192, key_listener: '`'};

Cheat_Menu.key_listeners = {};

Cheat_Menu.close_overlay = function() {
    Cheat_Menu.cheat_menu_open = false;
    if (Cheat_Menu.overlay_box.parentNode) Cheat_Menu.overlay_box.parentNode.removeChild(Cheat_Menu.overlay_box);
    if (Cheat_Menu.overlay.parentNode) Cheat_Menu.overlay.parentNode.removeChild(Cheat_Menu.overlay);
};

Cheat_Menu.prepare = function() {
	if (!Cheat_Menu.initialized) {
		for (var i = 0; i < $gameActors._data.length; i++) {
			if($gameActors._data[i]) {
				$gameActors._data[i].god_mode = false;
				if ($gameActors._data[i].god_mode_interval) {
					clearInterval($gameActors._data[i].god_mode_interval);
				}
			}
		}
		
		// reset to inital values
		for (var name in Cheat_Menu.initial_values) {
			Cheat_Menu[name] = Cheat_Menu.initial_values[name];
		}
		// load saved values if they exist
		if ($gameSystem.Cheat_Menu) {
			for (var name in $gameSystem.Cheat_Menu) {
				Cheat_Menu[name] = $gameSystem.Cheat_Menu[name];
			}
		}

		// if speed is locked then initialize it so effect is active
		if (Cheat_Menu.speed_unlocked == false) {
			Cheat_Menu.initialize_speed_lock();
		}

		// only do this once per load or new game
		Cheat_Menu.initialized = true;
	}
};
window.addEventListener("keydown", function(event) {
	if (false && !event.ctrlKey && !event.altKey && (event.keyCode === 119) && $gameTemp && !$gameTemp.isPlaytest()) {
		// open debug menu
		event.stopPropagation();
		event.preventDefault();
		require('nw.gui').Window.get().showDevTools();
	}
	else if (!event.altKey && !event.ctrlKey && !event.shiftKey && (event.keyCode === 120) && $gameTemp && !$gameTemp.isPlaytest()) {
		// trick the game into thinking its a playtest so it will open the switch/variable debug menu
		$gameTemp._isPlaytest = true;
		setTimeout(function() {
			// back to not being playtest
			$gameTemp._isPlaytest = false;
		}, 100);
	}
	else if (Cheat_Menu.overlay_openable && (SceneManager._scene instanceof Scene_Map || SceneManager._scene instanceof Scene_Battle) && !(SceneManager._scene instanceof Scene_Battle && SceneManager._scene._universalControlBattle) && !event.altKey && !event.ctrlKey && !event.shiftKey && !event.repeat && !/^(INPUT|TEXTAREA)$/.test((event.target && event.target.tagName) || "")) {
		// open and close menu
		if (event.keyCode == Cheat_Menu.keyCodes.KEYCODE_1.keyCode) {
			Cheat_Menu.prepare();

			// open menu
			if (!Cheat_Menu.cheat_menu_open) {
				Cheat_Menu.cheat_menu_open = true;
				document.body.appendChild(Cheat_Menu.overlay_box);
				document.body.appendChild(Cheat_Menu.overlay);
				Cheat_Menu.update_menu();
				SoundManager.playSystemSound(1);
			}
			// close menu
			else {
                Cheat_Menu.close_overlay();
                SoundManager.playSystemSound(2);
			}
		}

		// navigate and activate cheats
		else if (Cheat_Menu.cheat_menu_open) {
			// move menu position
			if (event.keyCode == Cheat_Menu.keyCodes.KEYCODE_TILDE.keyCode) {
				Cheat_Menu.position++;
				if (Cheat_Menu.position > 4) {
					Cheat_Menu.position = 0;
				}
				Cheat_Menu.update_menu();
			}

			else {
				for (var keyCode in Cheat_Menu.keyCodes) {
					if (Cheat_Menu.key_listeners[Cheat_Menu.keyCodes[keyCode].key_listener] && event.keyCode == Cheat_Menu.keyCodes[keyCode].keyCode) {
						Cheat_Menu.key_listeners[Cheat_Menu.keyCodes[keyCode].key_listener](event);
					}
				}
			}
		}
	}
});



/////////////////////////////////////////////////
// Load Hook
/////////////////////////////////////////////////

// close the menu and set for initialization on first open
//	timer to provide periodic updates if the menu is open
Cheat_Menu.initialize = function() {
	Cheat_Menu.overlay_openable = true;
	Cheat_Menu.initialized = false;
	Cheat_Menu.cheat_menu_open = false;
	Cheat_Menu.speed_initialized = false;
    Cheat_Menu.close_overlay();


	// periodic update
	clearInterval(Cheat_Menu.menu_update_timer);
	Cheat_Menu.menu_update_timer = setInterval(function() {
		if (Cheat_Menu.cheat_menu_open) {
			Cheat_Menu.update_menu();
		}
	}, 1000);
};

// add hook for loading a game
DataManager.default_loadGame = DataManager.loadGame;
DataManager.loadGame = function(savefileId) {
	Cheat_Menu.initialize();

	return DataManager.default_loadGame(savefileId);
};

// add hook for new game
DataManager.default_setupNewGame = DataManager.setupNewGame;
DataManager.setupNewGame = function() {
	Cheat_Menu.initialize();

	DataManager.default_setupNewGame();
};

// add hook for saving values (just added into $gameSystem to be saved)
DataManager.default_saveGame = DataManager.saveGame;
DataManager.saveGame = function(savefileId) {
	// save values that are in intial values
	$gameSystem.Cheat_Menu = {};
	for (var name in Cheat_Menu.initial_values) {
		$gameSystem.Cheat_Menu[name] = Cheat_Menu[name];
	}

	return DataManager.default_saveGame(savefileId);
};

// Integrated universal in-engine menu (no additional plugin file).
/*:
 * @plugindesc SWF Cheat Menu Integrated v2.5.0 — teleport, levels, skills, items and stack limits.
 * @author emerladCoder, NamelessMagician; integrated edition: SomeWellForever
 * @help Use F7 or the Control Menu / Меню управления key item on the map or in battle.
 * Auto / Русский / English changes the full menu only; key 1 remains in English.
 * For RPG Maker MV and MZ. Other plugins may require compatibility fixes.
 * @target MV MZ
 */
(function() {
'use strict';
var ITEM_ID = 0;
var MAPS = [];
var BASE_COUNTS = {};
var mapCache = {};
var IS_MZ = Utils.RPGMAKER_NAME === 'MZ';

var SWF_EN_STRINGS = {
    'стандартный': "default",
    'Меню управления': "Control Menu",
    'Управление персонажами, инвентарём и игрой. Доступен в бою.\nF7 — полное меню, 1 — быстрые читы.': "Manage characters, inventory, and game settings. Available in battle.\nF7 — full menu, 1 — quick cheats.",
    'Enter — выбрать · Esc / правая кнопка — назад · PageUp / PageDown — листать': "Enter — select · Esc / right-click — back · PageUp / PageDown — scroll",
    'Операция не выполнена: ': "Operation failed: ",
    '\nВозможно, нужна адаптация под плагины этой игры.': "\nThis game may require a plugin-specific compatibility fix.",
    'Применить': "Apply",
    'Отмена': "Cancel",
    'Введи целое число от ': "Enter an integer between ",
    ' до ': " and ",
    'Допустимый диапазон: ': "Allowed range: ",
    'Подтвердить': "Confirm",
    'Телепорт: посещённые карты': "Teleport: visited maps",
    'Телепортация не выполняет сюжетные события.': "Teleportation does not trigger story events.",
    'Телепорт: все карты игры': "Teleport: all game maps",
    'Включая тестовые и служебные карты. Сохрани игру отдельно.': "Includes test and unused maps. Save to a separate slot first.",
    'Возврат после телепорта': "Return from teleport",
    'Карта #': "Map #",
    'Точка возврата пока не записана.': "No return position has been recorded.",
    'Возврат': "Return",
    'Сюжетные события не откатываются.': "Story events are not reversed.",
    'Точки быстрого перемещения (3 слота)': "Fast travel points (3 slots)",
    'Противники: установить HP = 1': "Enemies: set HP to 1",
    'У живых противников осталось 1 HP.': "Living enemies now have 1 HP.",
    'Победить всех противников': "Defeat all enemies",
    'Мгновенно устанавливает HP всех живых врагов в 0 и завершает бой через штатную обработку победы.': "Sets every living enemy's HP to 0 and finishes the battle through the normal victory system.",
    'Победить всех противников?': "Defeat all enemies?",
    'У всех оставшихся врагов будет 0 HP.': "Every remaining enemy will have 0 HP.",
    'Персонажи: уровни, навыки, параметры, читы': "Characters: levels, skills, stats, cheats",
    'HP / MP / TP всей группы': "Party HP / MP / TP",
    'Пополнить ресурсы, обнулить их или снять все состояния.': "Restore, reduce, or clear party resources and states.",
    'Получить предмет / оружие / броню': "Get item / weapon / armor",
    'Лимит предметов: ': "Item stack limit: ",
    'Золото: ': "Gold: ",
    'Установить золото': "Set gold",
    'Игровые переключатели': "Game switches",
    'Игровые переменные': "Game variables",
    'ВКЛ': "ON",
    'ВЫКЛ': "OFF",
    'Проход сквозь стены: ': "Walk through walls: ",
    'Скорость движения: ': "Movement speed: ",
    'Скорость (0.5–6.0, шаг 0.5)': "Speed (0.5–6.0, increments of 0.5)",
    'Введите число от 0.5 до 6.0, шаг 0.5.': "Enter a number from 0.5 to 6.0 in steps of 0.5.",
    'Зафиксировать скорость: ': "Lock movement speed: ",
    'Вернуть предмет в инвентарь': "Restore control item to inventory",
    'Подготовить удаление мода': "Prepare to remove the mod",
    'Удалить служебный предмет?': "Remove the control item?",
    'Перед удалением верни лимит предметов к обычному и сохрани игру в другой слот.': "Reset the item stack limit to the game's default and save to another slot first.",
    'Закрыть меню и продолжить бой': "Close menu and resume battle",
    'Закрыть меню': "Close menu",
    'Меню управления · ': "Control Menu · ",
    ' · БОЙ': " · BATTLE",
    'Слот ': "Slot ",
    'пусто': "empty",
    ' · сохранить текущую точку': " · save current position",
    'Перезапишет слот. ': "Overwrite this slot. ",
    ' · переместиться · ': " · travel · ",
    'Переместиться в сохранённую точку. Не изменяет сюжетные флаги.': "Travel to saved position. Story flags are not changed.",
    'Переместиться в ': "Travel to ",
    'Карта ': "Map ",
    'Сохранённые точки': "Saved positions",
    'Ресурсы группы изменены.': "Party resources updated.",
    'Полностью восстановить всю группу': "Fully restore the entire party",
    'Группа восстановлена.': "Party restored.",
    'Восстановить ': "Restore ",
    ' до максимума': " to maximum",
    'Установить ': "Set party ",
    ' группы на 1': " to 1",
    ' группы на 0': " to 0",
    'Снять все состояния с группы': "Remove all party states",
    'Состояния группы очищены.': "Party states cleared.",
    'HP / MP / TP группы': "Party HP / MP / TP",
    'Стандартный (как в игре)': "Default (game setting)",
    '99 штук': "99 items",
    '999 штук': "999 items",
    '9999 штук': "9999 items",
    'Используется оригинальный предел игры. Уже накопленные большие стопки защищены от удаления при следующей выдаче.': "Use the game's original stack limit. Existing larger stacks will not be deleted when more items are added.",
    'Ограничение для обычных предметов, оружия и брони.\nНе затрагивает уникальные экземпляры и распознанные специальные ограничения.': "Applies to normal items, weapons, and armor.\nUnique instances and detected special limits remain unchanged.",
    'Лимит: ': "Limit: ",
    '. Изменение сохраняется при следующем сохранении игры.\nБольшие существующие стопки не уменьшаются автоматически.': ". The change is saved with your next game save.\nExisting larger stacks are not automatically reduced.",
    'Лимит инвентаря · ': "Inventory stack limit · ",
    'Не удалось прочитать карту': "Could not read the map",
    'Поиск по названию или ID': "Search by name or ID",
    'Название карты или ID (пусто — показать все)': "Map name or ID (blank — show all)",
    'Название карты из базы игры. Список может включать служебные карты.\nДанные и координаты будут прочитаны после выбора.\nПеред телепортом сохранись отдельно.': "Map names come from the game's database, including unused maps.\nMap data and coordinates are read after selection.\nSave separately before teleporting.",
    'Телепорт · найдено ': "Teleport · found ",
    'Читаю карту #': "Reading map #",
    'Карта не прочитана: ': "Map could not be read: ",
    '. Возможно, игра использует особый формат данных.': ". This game may use a nonstandard map format.",
    'Перейти в подобранную точку': "Travel to suggested landing point",
    'Проходимость рассчитывается по стандартным тайлам.\nПри наличии известных входов выбирается клетка рядом с ними.\nСобытия и нестандартные плагины коллизий могут влиять на переход.': "Passability uses the game's standard map tiles.\nIf known entrances exist, a nearby tile is preferred.\nEvents and nonstandard collision plugins may affect teleporting.",
    'Телепорт: ': "Teleport: ",
    'Перед переходом сохранись в отдельный слот.\nДля возвращения открой это меню через F7.\nТелепорт не устанавливает сюжетные флаги.': "Save to a separate slot before teleporting.\nUse this menu via F7 to return.\nTeleporting does not set story flags.",
    'Указать координаты вручную': "Enter coordinates manually",
    'Без автоматического смещения. Можно попасть в стену или на событие.': "No automatic adjustment. You may appear in a wall or on an event.",
    'Координаты X,Y (X: 0–': "Coordinates X,Y (X: 0–",
    'Неверные координаты. Введи X,Y в границах карты.': "Invalid coordinates. Enter X,Y within the map boundaries.",
    'Ручной телепорт': "Manual teleport",
    'В указанной клетке может быть стена или событие.\nF7 → возврат позволит вернуться, если игра продолжает работать.': "The destination may contain a wall or event.\nF7 → Return may help if the game is still running.",
    'Сначала выйди из транспорта.': "Leave the vehicle first.",
    ' · уровень ': " · level ",
    'Персонаж из текущего отряда, включая резерв.\nНастройка уровня не меняет сюжетные флаги.': "Current party member, including reserves.\nChanging levels does not update story flags.",
    'В отряде нет персонажей': "There are no characters in the party",
    'Персонажи отряда': "Party members",
    'Установить уровень: ': "Set level: ",
    'Опыт выставляется на начало выбранного уровня; классовые навыки сохраняются.': "EXP is set to the beginning of the selected level; learned class skills are retained.",
    'Уровень: ': "Level: ",
    'Добавить опыт': "Add EXP",
    'Бессмертие: ': "God mode: ",
    'Бессмертие старого Cheat_Menu. После загрузки сохранения его может потребоваться включить снова.': "Legacy Cheat_Menu god mode. You may need to enable it again after loading a save.",
    'Установить HP: ': "Set HP: ",
    'Установить MP: ': "Set MP: ",
    'Установить TP: ': "Set TP: ",
    'Полностью восстановить': "Fully restore",
    'Снять все состояния': "Remove all states",
    'Изменить бонусы характеристик': "Edit stat bonuses",
    'Изучить навык': "Learn a skill",
    'Забыть изученный навык': "Forget a learned skill",
    'Поиск по названию / ID': "Search by name / ID",
    'Навык или ID (пусто — все)': "Skill name or ID (blank — all)",
    ' [изучен]': " [learned]",
    'Удалить из изученных навыков.': "Remove from learned skills.",
    'Изучить напрямую, без траты очков дерева навыков.': "Learn directly without spending skill-tree points.",
    '\nСюжетные, классовые и экипировочные условия использования сохраняются.': "\nStory, class, and equipment restrictions on using skills still apply.",
    'Забыть: ': "Forget: ",
    'Изучить: ': "Learn: ",
    'Персонаж: ': "Character: ",
    'Навык удалён из изученных.': "Skill removed from learned skills.",
    'Навык изучен. Для применения могут требоваться класс, оружие или ресурсы.': "Skill learned. Its use may still require the right class, weapon, or resources.",
    'Забыть': "Forget",
    'Изучить': "Learn",
    'Выдача предметов': "Get items",
    'Обычные предметы': "Normal items",
    'Оружие': "Weapons",
    'Броня и аксессуары': "Armor and accessories",
    'Ключевые и скрытые предметы': "Key and hidden items",
    'Могут участвовать в квестовых проверках. Выдача не завершает квест.': "These items may affect quests. Adding them does not complete a quest.",
    'Все записи базы предметов (включая пустые)': "All database item entries (including empty)",
    'Служебные записи могут не иметь назначения. Для обычной игры используй другие категории.': "Unused entries may have no purpose. Use another category during normal play.",
    'Название или ID (пусто — все)': "Name or ID (blank — all)",
    '[без названия]': "[unnamed]",
    '\nВыдача через игровую систему предметов. Лимит: ': "\nItem given through the game's inventory system. Limit: ",
    '. Уникальные экземпляры и спецлимиты не меняются.': ". Unique instances and special stack limits remain unchanged.",
    'Предметы · найдено ': "Items · found ",
    'У этой игры нестандартная система экземпляров предметов. Нужна отдельная адаптация.': "This game uses nonstandard independent items and needs a compatibility fix.",
    'Не удалось определить лимит предмета: нестандартный плагин инвентаря.': "Cannot determine the item limit because of a nonstandard inventory plugin.",
    'Достигнут лимит этого предмета или категории экипировки.': "The limit for this item or equipment category has been reached.",
    'Сколько выдать: ': "Amount to give: ",
    'Выдать ': "Give ",
    'Квестовые и служебные предметы могут менять результаты проверок.\nПредметы не заменяют прохождение соответствующих событий.': "Quest and system items can change conditions checked by the game.\nGiving items does not complete their events.",
    'Добавлено: ': "Added: ",
    'Макс. HP': "Max HP",
    'Макс. MP': "Max MP",
    'Атака': "Attack",
    'Защита': "Defense",
    'Маг. атака': "Magic attack",
    'Маг. защита': "Magic defense",
    'Ловкость': "Agility",
    'Удача': "Luck",
    ' · бонус ': " · bonus ",
    'Бонус параметра ': "Stat bonus for ",
    ' (целое число)': " (integer)",
    'Введи целое число от -999999 до 999999.': "Enter an integer between -999999 and 999999.",
    'Бонусы · ': "Bonuses · ",
    'Поиск по ID / имени': "Search by ID / name",
    'Поиск переключателя': "Search switches",
    'Переключатели · ': "Switches · ",
    'Поиск переменной': "Search variables",
    'Новое значение переменной #': "New value for variable #",
    'Переменные · ': "Variables · ",
    'Язык меню: ': 'Menu language: ',
    'Выбор языка': 'Choose language',
    'Автоматически (по языку игры или системы)': 'Automatic (game or system language)',
    'Язык интерфейса меню не меняет названия предметов, карт и навыков, заданные самой игрой.': 'Changing the menu language does not translate items, maps, or skills provided by the game.',
    'Персонажи и отряд': 'Characters & party',
    'Уровни · навыки · HP / MP / TP': 'Levels · skills · HP / MP / TP',
    'Инвентарь': 'Inventory',
    'Предметы · оружие · броня': 'Items · weapons · armor',
    'Прогресс игры': 'Game progress',
    'Золото · переменные · флаги': 'Gold · variables · switches',
    'Мир и перемещение': 'World & travel',
    'Карты · телепорт · скорость': 'Maps · teleport · speed',
    'Бой': 'Battle',
    'Противники · победа': 'Enemies · victory',
    'Избранное': 'Favorites',
    'Быстрый доступ к отмеченному': 'Quick access to starred entries',
    'Настройки': 'Settings',
    'Язык · служебный предмет': 'Language · control item',
    'Список персонажей': 'Party characters',
    'Предметы, оружие и броня': 'Items, weapons and armor',
    'Предметы': 'Items',
    'Оружие': 'Weapons',
    'Броня и аксессуары': 'Armor & accessories',
    'Навыки': 'Skills',
    'Переключатели': 'Switches',
    'Переменные': 'Variables',
    'Карты': 'Maps',
    'Выбери персонажа для навыков': 'Choose an actor for skills',
    'Избранное хранится в текущем сохранении игры.': 'Favorites are stored in this game save.',
    'Поиск по названию или числовому идентификатору.': 'Search by name or numeric ID.',
    'Сортировка: ': 'Sort: ',
    'по названию': 'name',
    'избранное сверху': 'favorites first',
    'по ID': 'ID',
    'Переключить: по ID, по названию или избранное сверху.': 'Switch between ID, name and favorites first.',
    'Только избранное: ': 'Favorites only: ',
    'Показать только записи, отмеченные звёздочкой.': 'Show only starred entries.',
    'Редактирование ★: ': 'Edit ★: ',
    'Когда включено, выбор записи меняет ★ вместо выполнения действия.': 'When enabled, choosing an entry toggles ★ without executing its action.',
    '\\n★: добавь в избранное через режим редактирования.': '\\n★: use Edit ★ to add or remove favorites.',
    'SWF Cheat Menu · ': 'SWF Cheat Menu · '
};
var SWF_LANG_KEY = 'SWF_CheatMenu.menuLanguage';
var swfLanguageSetting = 'auto';
try {
    var swfStoredLanguage = window.localStorage.getItem(SWF_LANG_KEY);
    if (swfStoredLanguage === 'ru' || swfStoredLanguage === 'en') swfLanguageSetting = swfStoredLanguage;
} catch (ignored) {}
function swfCurrentLanguage() {
    if (swfLanguageSetting !== 'auto') return swfLanguageSetting;
    var gameLocale = typeof $dataSystem !== 'undefined' && $dataSystem ? String($dataSystem.locale || '') : '';
    var systemLocale = typeof navigator !== 'undefined' ? String(navigator.language || '') : '';
    return /^ru(?:[-_]|$)/i.test(gameLocale || systemLocale) ? 'ru' : 'en';
}
function TR(ru) {
    if (swfCurrentLanguage() === 'ru') return ru;
    return Object.prototype.hasOwnProperty.call(SWF_EN_STRINGS, ru) ? SWF_EN_STRINGS[ru] : ru;
}
function swfLanguageLabel() {
    return swfLanguageSetting === 'auto' ? 'Auto' : swfLanguageSetting === 'ru' ? 'Русский' : 'English';
}
function swfSetLanguage(lang) {
    if (lang !== 'auto' && lang !== 'ru' && lang !== 'en') return;
    swfLanguageSetting = lang;
    try { window.localStorage.setItem(SWF_LANG_KEY, lang); } catch (ignored) {}
    if (typeof $dataItems !== 'undefined' && $dataItems && $dataItems[ITEM_ID] && itemIsControl($dataItems[ITEM_ID])) {
        $dataItems[ITEM_ID].name = TR('Меню управления');
        $dataItems[ITEM_ID].description = TR('Управление персонажами, инвентарём и игрой. Доступен в бою.\nF7 — полное меню, 1 — быстрые читы.');
    }
}

var openRequested = false;
// Per-save stack size setting. Zero means the original game limit.
function selectedStackLimit() {
    if (!$gameSystem) return 0;
    var selected = Number($gameSystem._universalControlItemCap || 0);
    return selected === 99 || selected === 999 || selected === 9999 ? selected : 0;
}
function stackLimitLabel() {
    var limit = selectedStackLimit();
    return limit ? String(limit) : TR('стандартный');
}
// A unique-instance item cannot be given as a larger stack. Also avoid overriding
// explicit per-item caps described in common note tags used by other plugins.
function eligibleForStackLimit(item) {
    if (!item || itemIsControl(item)) return false;
    if (!(DataManager.isItem(item) || DataManager.isWeapon(item) || DataManager.isArmor(item))) return false;
    if (typeof DataManager.isIndependent === 'function' && DataManager.isIndependent(item)) return false;
    if (item.meta && (item.meta.IndependentItem || item.meta.Independent || item.meta.NoStack || item.meta.NoStacking)) return false;
    var note = String(item.note || '');
    if (/<\s*(?:max\s*items?|item\s*max(?:imum)?|stack\s*(?:limit|max)|max\s*stack|itemmaxnum)\s*:\s*\d+\s*>/i.test(note)) return false;
    if (/(?:^|\n)\s*itemMaxNum\s*:\s*\d+/i.test(note)) return false;
    return true;
}
// Call the game's previous implementation first, so other inventory plugins
// can retain their own special-item and category behavior.
var previousMaxItems = Game_Party.prototype.maxItems;
Game_Party.prototype.maxItems = function(item) {
    var original = previousMaxItems.apply(this, arguments);
    if (!eligibleForStackLimit(item)) return original;
    var selected = selectedStackLimit();
    var result = selected || original;
    if (typeof result !== 'number' || !isFinite(result) || result < 0) return original;
    // Do not destroy already owned surplus on the next gainItem() after lowering
    // the limit (including when switching back to the game's original value).
    var owned = this.numItems(item);
    if (typeof owned === 'number' && isFinite(owned) && owned > result) result = Math.floor(owned);
    return result;
};
function clean(s) { return String(s || '').replace(/\\[A-Za-z]+\[[^\]]*\]/g, '').replace(/[\r\n]+/g, ' '); }
function itemIsControl(item) { return item && item.id === ITEM_ID && item.meta && item.meta.UniversalControl; }
function installItem(data) {
    var found = data.filter(function(item) { return item && item.meta && item.meta.UniversalControl; })[0];
    ITEM_ID = found ? found.id : data.length;
    BASE_COUNTS.items = found ? found.id : data.length;
    data[ITEM_ID] = {id:ITEM_ID,name:TR('Меню управления'),description:TR('Управление персонажами, инвентарём и игрой. Доступен в бою.\nF7 — полное меню, 1 — быстрые читы.'),iconIndex:83,itypeId:2,consumable:false,occasion:0,scope:0,speed:0,successRate:100,repeats:1,tpGain:0,hitType:0,animationId:0,price:0,damage:{critical:false,elementId:0,formula:'0',type:0,variance:0},effects:[],note:'<UniversalControl>\n<Not Independent Item>\nitemMaxNum:1',meta:{UniversalControl:true},nonIndependent:true};
}
var oldOnLoad = DataManager.onLoad;
DataManager.onLoad = function(object) {
    // Append the single universal item only after other database loaders.
    var result = oldOnLoad.apply(this, arguments);
    if (object === $dataItems) installItem(object);
    if (object === $dataWeapons) BASE_COUNTS.weapons = object.length;
    if (object === $dataArmors) BASE_COUNTS.armors = object.length;
    if (object === $dataMapInfos) MAPS = object.filter(function(m){return m && m.id > 0;}).map(function(m){return {id:m.id,name:m.name||('Map '+m.id),internal:m.name||'',parent:m.parentId};});
    return result;
};
function ensureItem() {
    if ($gameSystem && $gameSystem._universalControlDisabled) return;
    if ($gameSystem && $gameSystem._universalControlItemId && $gameSystem._universalControlItemId !== ITEM_ID) {
        var oldId=$gameSystem._universalControlItemId;
        if (!$dataItems[oldId] || itemIsControl($dataItems[oldId])) delete $gameParty._items[oldId];
    }
    if ($gameSystem) $gameSystem._universalControlItemId=ITEM_ID;
    if ($gameParty && $dataItems && itemIsControl($dataItems[ITEM_ID])) $gameParty._items[ITEM_ID] = 1;
}
var oldNewGame = DataManager.setupNewGame;
DataManager.setupNewGame = function() { oldNewGame.apply(this, arguments); ensureItem(); };
var oldExtract = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) { oldExtract.apply(this, arguments); ensureItem(); };
var oldItemOK = Scene_Item.prototype.onItemOk;
Scene_Item.prototype.onItemOk = function() {
    if (itemIsControl(this.item())) { SceneManager.push(Scene_UniversalControl); return; }
    oldItemOK.apply(this, arguments);
};
// F7 is a fallback when the inventory or a scripted map is inconvenient.
document.addEventListener('keydown', function(e) {
    if (e.keyCode === 118 && !e.repeat && (SceneManager._scene instanceof Scene_Map || SceneManager._scene instanceof Scene_Battle)) {
        e.preventDefault();
        if (SceneManager._scene instanceof Scene_Battle && SceneManager._scene._universalControlBattle) {
            openRequested = false; SceneManager._scene.closeUniversalControl(); return;
        }
        openRequested = true;
    }
});
// Special item is always visible/usable in the Battle Item list, even when
// custom battle item filters normally hide key items.
if (typeof Window_BattleItem !== 'undefined') {
    var previousBattleIncludes = Window_BattleItem.prototype.includes;
    Window_BattleItem.prototype.includes = function(item) {
        return itemIsControl(item) || previousBattleIncludes.apply(this, arguments);
    };
    var previousBattleItemEnabled = Window_BattleItem.prototype.isEnabled;
    Window_BattleItem.prototype.isEnabled = function(item) {
        return itemIsControl(item) || previousBattleItemEnabled.apply(this, arguments);
    };
}
var oldMapStart = Scene_Map.prototype.start;
Scene_Map.prototype.start = function() {
    oldMapStart.apply(this,arguments);
    if($gameSystem && $gameMap.mapId()>0){
        $gameSystem._universalControlVisited=$gameSystem._universalControlVisited||{};
        $gameSystem._universalControlVisited[$gameMap.mapId()]=true;
    }
};
var oldMapUpdate = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() {
    oldMapUpdate.apply(this, arguments);
    if (openRequested && !SceneManager.isSceneChanging() && !$gamePlayer.isTransferring()) {
        openRequested = false; ensureItem(); SceneManager.push(Scene_UniversalControl);
    }
};
// Recheck landing tiles against active collision/events after the map is loaded.
function landingPoint(map, player, x, y) {
    var dirs = [[2,0,1],[4,-1,0],[6,1,0],[8,0,-1]];
    var candidates = [];
    for (var yy = Math.max(0,y-12); yy < Math.min(map.height(),y+13); yy++) {
        for (var xx = Math.max(0,x-12); xx < Math.min(map.width(),x+13); xx++) candidates.push([xx,yy]);
    }
    candidates.sort(function(a,b) { return Math.abs(a[0]-x)+Math.abs(a[1]-y)-Math.abs(b[0]-x)-Math.abs(b[1]-y); });
    for (var i=0;i<candidates.length;i++) {
        var p=candidates[i];
        if (map.eventsXy(p[0],p[1]).length || map.isDamageFloor(p[0],p[1])) continue;
        if (dirs.some(function(d) {
            var nx=p[0]+d[1],ny=p[1]+d[2];
            return map.isValid(nx,ny) && map.isPassable(p[0],p[1],d[0]) && map.isPassable(nx,ny,10-d[0]) && !map.eventsXyNt(nx,ny).some(function(e){return e.isNormalPriority();});
        })) return p;
    }
    return null;
}
var oldTransfer = Game_Player.prototype.performTransfer;
Game_Player.prototype.performTransfer = function() {
    var pending=$gameTemp._universalControlLanding;
    var applies=pending && this.isTransferring() && this._newMapId === pending.mapId;
    oldTransfer.apply(this, arguments);
    if (applies) {
        if (pending.adjust) {
            var p=landingPoint($gameMap,this,this.x,this.y);
            if (p) this.locate(p[0],p[1]);
        }
        $gameTemp._universalControlLanding=null;
    }
};

/* Favorites are stored in $gameSystem so they belong to a specific save file.
 * Category + database ID (not a localized name) is the stable lookup key. */
function swfFavorites(kind){
    if(!$gameSystem)return {};
    var all=$gameSystem._swfFavorites;
    if(!all || typeof all!=='object' || Array.isArray(all))all=$gameSystem._swfFavorites={};
    var group=all[kind];
    if(!group || typeof group!=='object' || Array.isArray(group))group=all[kind]={};
    return group;
}
function swfIsFavorite(kind,id){return swfFavorites(kind)[id]===true;}
function swfToggleFavorite(kind,id){
    if(!$gameSystem || !isFinite(Number(id)) || Number(id)<1)return;
    var group=swfFavorites(kind);
    if(group[id]===true)delete group[id];
    else group[id]=true;
}
function swfFavoriteCount(kind){
    return Object.keys(swfFavorites(kind)).filter(function(id){return swfIsFavorite(kind,id);}).length;
}
function swfSortMode(kind){
    var all=$gameSystem && $gameSystem._swfSortModes;
    var result=all&&all[kind];
    return result==='name'||result==='favorites' ? result : 'id';
}
function swfCycleSort(kind){
    if(!$gameSystem)return;
    var all=$gameSystem._swfSortModes;
    if(!all || typeof all!=='object' || Array.isArray(all))all=$gameSystem._swfSortModes={};
    all[kind]=swfSortMode(kind)==='id'?'name':swfSortMode(kind)==='name'?'favorites':'id';
}
function swfSortCatalog(data,kind){
    var mode=swfSortMode(kind),out=data.slice();
    out.sort(function(a,b){
        if(mode==='favorites'){
            var favoriteDiff=Number(swfIsFavorite(kind,b.id))-Number(swfIsFavorite(kind,a.id));
            if(favoriteDiff)return favoriteDiff;
        }
        if(mode==='name'){
            var nameDiff=clean(a.name).localeCompare(clean(b.name));
            if(nameDiff)return nameDiff;
        }
        return a.id-b.id;
    });
    return out;
}
function swfSortLabel(kind){
    var mode=swfSortMode(kind);
    return mode==='name'?TR('по названию'):mode==='favorites'?TR('избранное сверху'):TR('по ID');
}
function swfStar(kind,id){return swfIsFavorite(kind,id)?'★':'☆';}

function Window_UniversalList() { this.initialize.apply(this,arguments); }
Window_UniversalList.prototype=Object.create(Window_Command.prototype);
Window_UniversalList.prototype.constructor=Window_UniversalList;
Window_UniversalList.prototype.initialize=function(y,h) { this._rows=[];this._height=h;if(IS_MZ)Window_Command.prototype.initialize.call(this,new Rectangle(0,y,Graphics.boxWidth,h));else Window_Command.prototype.initialize.call(this,0,y); };
Window_UniversalList.prototype.windowWidth=function(){return Graphics.boxWidth;};
Window_UniversalList.prototype.maxCols=function(){return this._swfGrid?2:1;};
Window_UniversalList.prototype.itemHeight=function(){
    if(this._swfGrid)return Math.max(80,Math.min(108,Math.floor((this.height-(this.padding||12)*2)/3)));
    return Window_Command.prototype.itemHeight.call(this);
};
Window_UniversalList.prototype.drawItem=function(index){
    if(!this._swfGrid){var entry=this._rows[index];if(entry&&entry._swfTool){var box=this.itemRect(index);this.contents.fillRect(box.x+3,box.y+2,Math.max(2,box.width-12),Math.max(2,box.height-4),'#253852');}Window_Command.prototype.drawItem.call(this,index);return;}
    var row=this._rows[index],rect=this.itemRect(index),gutter=5;
    if(!row)return;
    this.contents.fillRect(rect.x+gutter,rect.y+gutter,rect.width-2*gutter,rect.height-2*gutter,'#28364c');
    this.contents.fillRect(rect.x+gutter,rect.y+gutter,3,rect.height-2*gutter,'#7498cb');
    var oldSize=this.contents.fontSize,oldColor=this.contents.textColor;
    this.changePaintOpacity(row.enabled!==false);
    this.resetTextColor();
    var title=String(row.name),available=Math.max(40,rect.width-28);
    this.contents.fontSize=Math.max(16,Math.min(23,Math.floor(available/Math.max(1,title.length*0.59))));
    this.drawText(title,rect.x+17,rect.y+12,available,'left');
    this.contents.fontSize=Math.max(12,Math.min(16,Math.floor(available/Math.max(1,String(row.subtitle||'').length*0.53))));
    this.changeTextColor('#c0cee0');
    this.drawText(row.subtitle||'',rect.x+17,rect.y+47,available,'left');
    this.contents.fontSize=oldSize;
    this.contents.textColor=oldColor;
    this.changePaintOpacity(true);
};
Window_UniversalList.prototype.windowHeight=function(){return this._height;};
Window_UniversalList.prototype.standardFontSize=function(){return 23;};
Window_UniversalList.prototype.makeCommandList=function(){
    this._rows.forEach(function(r){this.addCommand(r.name,'choose',r.enabled!==false,r);},this);
};
Window_UniversalList.prototype.setRows=function(rows,index,grid){
    this._swfGrid=!!grid;
    this._rows=rows;
    this.refresh();
    this.select(Math.min(Math.max(0,index||0),Math.max(0,rows.length-1)));
    this.activate();
};
Window_UniversalList.prototype.updateHelp=function(){if(this._helpWindow){var r=this.currentExt();this._helpWindow.setText(r&&r.help?r.help:TR('Enter — выбрать · Esc / правая кнопка — назад · PageUp / PageDown — листать'));}};

// Scroll indicator rendered by RPG Maker itself (MV/MZ Pixi), with no
// permanent browser overlay or global pointer/keyboard listeners.
var swfListOldInitialize=Window_UniversalList.prototype.initialize;
Window_UniversalList.prototype.initialize=function(y,h){
    swfListOldInitialize.call(this,y,h);
    var pad=this.padding||12;
    this._swfScrollBar=new Sprite(new Bitmap(12,Math.max(24,this.height-pad*2)));
    this._swfScrollBar.x=this.width-pad-12;
    this._swfScrollBar.y=pad;
    this._swfScrollBar.visible=false;
    this.addChild(this._swfScrollBar);
    this._swfScrollKey='';
    this._swfDragging=false;
};
Window_UniversalList.prototype._swfBarHit=function(x,y){
    var b=this._swfScrollBar;
    return !!(b&&b.visible&&x>=this.x+b.x-3&&x<=this.x+b.x+15&&
              y>=this.y+b.y&&y<=this.y+b.y+b.bitmap.height);
};
Window_UniversalList.prototype._swfSeekScroll=function(y){
    var max=this.maxTopRow();
    if(max<=0)return;
    var bitmap=this._swfScrollBar.bitmap, h=bitmap.height;
    var visible=Math.max(1,this.maxPageRows()),total=Math.max(visible,this.maxItems());
    var thumb=Math.max(20,Math.min(h,Math.round(h*visible/total)));
    var ratio=Math.max(0,Math.min(1,(y-this.y-this._swfScrollBar.y-thumb/2)/Math.max(1,h-thumb)));
    var top=Math.round(max*ratio);
    if(this.index()<top || this.index()>=top+visible)this.select(top);
    this.setTopRow(top);
};
var swfListOldProcessTouch=Window_UniversalList.prototype.processTouch;
Window_UniversalList.prototype.processTouch=function(){
    // Don't let a scrollbar drag accidentally activate a cheat command.
    if(this._swfDragging || (TouchInput.isTriggered()&&this._swfBarHit(TouchInput.x,TouchInput.y)))return;
    swfListOldProcessTouch.call(this);
};
var swfListOldUpdate=Window_UniversalList.prototype.update;
Window_UniversalList.prototype.update=function(){
    swfListOldUpdate.call(this);
    var b=this._swfScrollBar;
    if(!b)return;
    var max=Math.max(0,this.maxTopRow()),h=b.bitmap.height;
    b.visible=max>0;
    if(!b.visible){this._swfDragging=false;return;}
    if(this.active&&TouchInput.isTriggered()&&this._swfBarHit(TouchInput.x,TouchInput.y)){
        this._swfDragging=true;
        this._swfSeekScroll(TouchInput.y);
    } else if(this._swfDragging){
        if(TouchInput.isPressed())this._swfSeekScroll(TouchInput.y);
        else this._swfDragging=false;
    }
    var visible=Math.max(1,this.maxPageRows()),total=Math.max(visible,this.maxItems());
    var thumb=Math.max(20,Math.min(h,Math.round(h*visible/total)));
    var top=Math.round((h-thumb)*(this.topRow()/Math.max(1,max)));
    var key=[h,top,thumb,total,visible].join(':');
    if(key===this._swfScrollKey)return;
    this._swfScrollKey=key;
    var bmp=b.bitmap;bmp.clear();
    bmp.fillRect(1,0,10,h,'rgba(130,151,180,0.40)');
    bmp.fillRect(1,top,10,thumb,'#afcaed');
};

function Scene_UniversalControl(){this.initialize.apply(this,arguments);}
Scene_UniversalControl.prototype=Object.create(Scene_MenuBase.prototype);
Scene_UniversalControl.prototype.constructor=Scene_UniversalControl;
Scene_UniversalControl.prototype.initialize=function(){Scene_MenuBase.prototype.initialize.call(this);this._pages=[];this._battleMode=false;this._swfOnlyFavorites={};this._swfEditingFavorites={};};
// Built-in background: does not require img/pictures/Scene_UniversalControl_back.png.
// Deliberately bypasses image-based background plugins (including MOG_MenuBackground).
Scene_UniversalControl.prototype.createBackground=function(){
    if (Object.prototype.hasOwnProperty.call(SceneManager, "_mback")) SceneManager._mback=false;
    this._backgroundSprite=new Sprite();
    this._backgroundSprite.bitmap=new Bitmap(Graphics.width,Graphics.height);
    this._backgroundSprite.bitmap.fillAll('#161e2d');
    this.addChild(this._backgroundSprite);
};
// Explicit skip hook for plugins that inspect background eligibility on the scene.
Scene_UniversalControl.prototype.skip_mbackground=function(){return true;};
Scene_UniversalControl.prototype.create=function(){
    if (Cheat_Menu.cheat_menu_open) Cheat_Menu.close_overlay();
    Cheat_Menu.prepare();
    Scene_MenuBase.prototype.create.call(this);
    var titleH=72,helpH=144;
    this._titleWindow=IS_MZ?new Window_Help(new Rectangle(0,0,Graphics.boxWidth,titleH)):new Window_Help(1);this.addWindow(this._titleWindow);
    this._helpWindow=IS_MZ?new Window_Help(new Rectangle(0,Graphics.boxHeight-helpH,Graphics.boxWidth,helpH)):new Window_Help(3);this._helpWindow.y=Graphics.boxHeight-this._helpWindow.height;this.addWindow(this._helpWindow);
    this._listWindow=new Window_UniversalList(this._titleWindow.height,this._helpWindow.y-this._titleWindow.height);
    this._listWindow.setHelpWindow(this._helpWindow);this._listWindow.setHandler('choose',this.choose.bind(this));this._listWindow.setHandler('cancel',this.back.bind(this));this.addWindow(this._listWindow);
    this.main();
};
Scene_UniversalControl.prototype.terminate=function(){if(this._modal)this._modal.remove();this._modal=null;Scene_MenuBase.prototype.terminate.call(this);};
Scene_UniversalControl.prototype.choose=function(){var row=this._listWindow.currentExt();try{if(row&&row.run)row.run();else this._listWindow.activate();}catch(e){console.error('[UniversalControlMenu]',e);this.notice(TR('Операция не выполнена: ')+e.message+TR('\nВозможно, нужна адаптация под плагины этой игры.'));}};
Scene_UniversalControl.prototype.showPage=function(title,rows,replace,grid){
    if(!replace&&this._page){this._page.index=this._listWindow.index();this._pages.push(this._page);}
    var index=this._swfKeepIndex||0;this._swfKeepIndex=0;
    this._page={title:title,rows:rows,index:index,grid:!!grid};this.renderPage();
};
Scene_UniversalControl.prototype.renderPage=function(){
    this._titleWindow.setText(this._page.title);
    this._listWindow.setRows(this._page.rows,this._page.index,this._page.grid);
};
Scene_UniversalControl.prototype._swfRefreshCatalog=function(callback){
    this._swfKeepIndex=this._listWindow.index();
    callback();
};
Scene_UniversalControl.prototype._swfCatalogTools=function(kind,query,refresh){
    var self=this;
    this._swfOnlyFavorites=this._swfOnlyFavorites||{};
    this._swfEditingFavorites=this._swfEditingFavorites||{};
    return [
        {_swfTool:true,name:TR('Поиск по названию / ID')+(query?' — '+query:''),help:TR('Поиск по названию или числовому идентификатору.'),run:function(){self.ask(TR('Название или ID (пусто — все)'),query,function(v){refresh(v);});}},
        {_swfTool:true,name:TR('Сортировка: ')+swfSortLabel(kind),help:TR('Переключить: по ID, по названию или избранное сверху.'),run:function(){swfCycleSort(kind);self._swfRefreshCatalog(function(){refresh(query);});}},
        {_swfTool:true,name:TR('Только избранное: ')+(this._swfOnlyFavorites[kind]?TR('ВКЛ'):TR('ВЫКЛ')),help:TR('Показать только записи, отмеченные звёздочкой.'),run:function(){self._swfOnlyFavorites[kind]=!self._swfOnlyFavorites[kind];self._swfRefreshCatalog(function(){refresh(query);});}},
        {_swfTool:true,name:TR('Редактирование ★: ')+(this._swfEditingFavorites[kind]?TR('ВКЛ'):TR('ВЫКЛ')),help:TR('Когда включено, выбор записи меняет ★ вместо выполнения действия.'),run:function(){self._swfEditingFavorites[kind]=!self._swfEditingFavorites[kind];self._swfRefreshCatalog(function(){refresh(query);});}}
    ];
};
Scene_UniversalControl.prototype._swfCatalogRows=function(kind,data,renderRow,refresh,query){
    var self=this,tools=this._swfCatalogTools(kind,query,refresh);
    var selected=swfSortCatalog(data,kind).filter(function(entry){
        return !self._swfOnlyFavorites[kind]||swfIsFavorite(kind,entry.id);
    });
    selected.forEach(function(entry){
        var row=renderRow(entry);
        var original=row.run;
        row.name=swfStar(kind,entry.id)+' '+row.name;
        row.help=(row.help||'')+TR('\n★: добавь в избранное через режим редактирования.');
        row.run=function(){
            if(self._swfEditingFavorites[kind]){
                swfToggleFavorite(kind,entry.id);
                self._swfRefreshCatalog(function(){refresh(query);});
            }else if(original)original();
        };
        tools.push(row);
    });
    return tools;
};
Scene_UniversalControl.prototype.back=function(){if(this._pages.length){this._page=this._pages.pop();this.renderPage();}else this.close();};
Scene_UniversalControl.prototype.close=function(){
    if (this._battleMode && this._battleScene) this._battleScene.closeUniversalControl();
    else SceneManager.pop();
};
Scene_UniversalControl.prototype.notice=function(text){this._helpWindow.setText(text);this._listWindow.activate();};
Scene_UniversalControl.prototype.ask=function(title,value,callback){
    var self=this;this._listWindow.deactivate();Input.clear();TouchInput.clear();
    var cover=document.createElement('div');cover.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:2147483647;display:flex;align-items:center;justify-content:center;font:20px Arial;color:#fff';
    var box=document.createElement('form');box.style.cssText='width:min(580px,85vw);padding:28px;background:#202634;border:1px solid #8094ba;border-radius:12px';
    var label=document.createElement('label');label.textContent=title;label.style.cssText='display:block;margin-bottom:18px;white-space:pre-line';
    var input=document.createElement('input');input.value=value||'';input.style.cssText='box-sizing:border-box;width:100%;font:22px Arial;padding:12px;margin-bottom:18px';
    var ok=document.createElement('button');ok.type='submit';ok.textContent=TR('Применить');
    var cancel=document.createElement('button');cancel.type='button';cancel.textContent=TR('Отмена');
    [ok,cancel].forEach(function(b){b.style.cssText='font:20px Arial;padding:10px 18px;margin-right:12px;cursor:pointer';});
    function finish(v){cover.remove();self._modal=null;Input.clear();TouchInput.clear();self._listWindow.activate();if(v!==null)callback(v);}
    box.appendChild(label);label.appendChild(input);box.appendChild(ok);box.appendChild(cancel);cover.appendChild(box);document.body.appendChild(cover);this._modal=cover;
    box.onsubmit=function(e){e.preventDefault();finish(input.value);};cancel.onclick=function(){finish(null);};
    ['keydown','keyup','keypress'].forEach(function(type){cover.addEventListener(type,function(e){e.stopPropagation();if(type==='keydown'&&e.key==='Escape'){e.preventDefault();finish(null);}});});
    ['mousedown','mouseup','touchstart','touchend','wheel'].forEach(function(type){cover.addEventListener(type,function(e){e.stopPropagation();});});
    input.focus();input.select();
};
Scene_UniversalControl.prototype.askNumber=function(title,value,min,max,callback){
    var self=this;this.ask(title+' ('+min+'–'+max+')',String(value),function(s){
        if(!/^\d+$/.test(s.trim())){self.notice(TR('Введи целое число от ')+min+TR(' до ')+max+'.');return;}
        var n=Number(s);if(n<min||n>max){self.notice(TR('Допустимый диапазон: ')+min+'–'+max+'.');return;}callback(n);
    });
};
Scene_UniversalControl.prototype.confirm=function(title,help,action){
    var self=this;this.showPage(title,[{name:TR('Подтвердить'),help:help,run:action},{name:TR('Отмена'),run:function(){self.back();}}]);
};
// The six categories are the only commands shown at the top level.
// The grid uses the same RPG Maker window/input model as the normal lists.
Scene_UniversalControl.prototype.main=function(){
    var self=this,battle=!!this._battleMode;
    this._swfOnlyFavorites={};this._swfEditingFavorites={};
    var rows=[
        {name:TR('Персонажи и отряд'),subtitle:TR('Уровни · навыки · HP / MP / TP'),run:function(){self.sectionActors();}},
        {name:TR('Инвентарь'),subtitle:TR('Предметы · оружие · броня'),run:function(){self.sectionInventory();}},
        battle
          ?{name:TR('Прогресс игры'),subtitle:TR('Золото · переменные · флаги'),run:function(){self.sectionProgress();}}
          :{name:TR('Мир и перемещение'),subtitle:TR('Карты · телепорт · скорость'),run:function(){self.sectionWorld();}},
        battle
          ?{name:TR('Бой'),subtitle:TR('Противники · победа'),run:function(){self.sectionBattle();}}
          :{name:TR('Прогресс игры'),subtitle:TR('Золото · переменные · флаги'),run:function(){self.sectionProgress();}},
        {name:TR('Избранное'),subtitle:TR('Быстрый доступ к отмеченному'),run:function(){self.favorites();}},
        {name:TR('Настройки'),subtitle:TR('Язык · служебный предмет'),run:function(){self.sectionSettings();}}
    ];
    this.showPage(TR('SWF Cheat Menu · ')+(IS_MZ?'MZ':'MV')+(battle?TR(' · БОЙ'):''),rows,true,true);
};
Scene_UniversalControl.prototype.sectionActors=function(){
    var self=this;
    this.showPage(TR('Персонажи и отряд'),[
        {name:TR('Список персонажей'),run:function(){self.actors();}},
        {name:TR('HP / MP / TP всей группы'),help:TR('Пополнить ресурсы, обнулить их или снять все состояния.'),run:function(){self.partyResources();}}
    ]);
};
Scene_UniversalControl.prototype.sectionInventory=function(){
    var self=this;
    this.showPage(TR('Инвентарь'),[
        {name:TR('Предметы, оружие и броня'),run:function(){self.itemCategories();}},
        {name:TR('Лимит предметов: ')+stackLimitLabel(),run:function(){self.stackLimits();}}
    ]);
};
Scene_UniversalControl.prototype.sectionWorld=function(replace){
    if(this._battleMode)return;
    var self=this,ret=$gameSystem._universalControlReturn;
    var through=$gamePlayer.isThrough&&$gamePlayer.isThrough()?TR('ВКЛ'):TR('ВЫКЛ');
    var speed=$gamePlayer.moveSpeed?$gamePlayer.moveSpeed():$gamePlayer._moveSpeed;
    this.showPage(TR('Мир и перемещение'),[
        {name:TR('Телепорт: посещённые карты'),help:TR('Телепортация не выполняет сюжетные события.'),run:function(){self.maps(true,'');}},
        {name:TR('Телепорт: все карты игры'),help:TR('Включая тестовые и служебные карты. Сохрани игру отдельно.'),run:function(){self.maps(false,'');}},
        {name:TR('Возврат после телепорта'),enabled:!!ret,help:ret?TR('Карта #')+ret.mapId+' · '+ret.x+', '+ret.y:TR('Точка возврата пока не записана.'),run:function(){self.confirm(TR('Возврат'),TR('Сюжетные события не откатываются.'),function(){self.teleport(ret.mapId,ret.x,ret.y,ret.direction,false,false);});}},
        {name:TR('Точки быстрого перемещения (3 слота)'),run:function(){self.savedPositions();}},
        {name:TR('Проход сквозь стены: ')+through,run:function(){$gamePlayer.setThrough(!$gamePlayer.isThrough());self.sectionWorld(true);}},
        {name:TR('Скорость движения: ')+speed,run:function(){self.ask(TR('Скорость (0.5–6.0, шаг 0.5)'),String(speed),function(v){
            var n=Number(v);if(!isFinite(n)||n<0.5||n>6||Math.round(n*2)!==n*2){self.notice(TR('Введите число от 0.5 до 6.0, шаг 0.5.'));return;}
            if(Cheat_Menu.speed_initialized && !Cheat_Menu.speed_unlocked)Cheat_Menu.speed_unlocked=true;
            $gamePlayer.setMoveSpeed(n);self.sectionWorld(true);
        });}},
        {name:TR('Зафиксировать скорость: ')+(Cheat_Menu.speed_unlocked?TR('ВЫКЛ'):TR('ВКЛ')),run:function(){Cheat_Menu.toggle_lock_player_speed();self.sectionWorld(true);}}
    ],replace);
};
Scene_UniversalControl.prototype.sectionProgress=function(replace){
    var self=this;
    this.showPage(TR('Прогресс игры'),[
        {name:TR('Золото: ')+$gameParty.gold(),run:function(){self.askNumber(TR('Установить золото'),$gameParty.gold(),0,999999999,function(n){$gameParty.gainGold(n-$gameParty.gold());self.sectionProgress(true);self.notice(TR('Золото: ')+$gameParty.gold());});}},
        {name:TR('Игровые переключатели'),run:function(){self.extraSwitches('');}},
        {name:TR('Игровые переменные'),run:function(){self.extraVariables('');}}
    ],replace);
};
Scene_UniversalControl.prototype.sectionBattle=function(){
    if(!this._battleMode)return;
    var self=this;
    this.showPage(TR('Бой'),[
        {name:TR('Противники: установить HP = 1'),run:function(){Cheat_Menu.set_enemy_hp(1,true);self.notice(TR('У живых противников осталось 1 HP.'));}},
        {name:TR('Победить всех противников'),help:TR('Мгновенно устанавливает HP всех живых врагов в 0 и завершает бой через штатную обработку победы.'),run:function(){
            self.confirm(TR('Победить всех противников?'),TR('У всех оставшихся врагов будет 0 HP.'),function(){self.close();Cheat_Menu.set_enemy_hp(0,true);});
        }}
    ]);
};
Scene_UniversalControl.prototype.sectionSettings=function(replace){
    var self=this;
    this.showPage(TR('Настройки'),[
        {name:TR('Язык меню: ')+swfLanguageLabel(),help:TR('Язык интерфейса меню не меняет названия предметов, карт и навыков, заданные самой игрой.'),run:function(){
            self.showPage(TR('Выбор языка'),[
                {name:TR('Автоматически (по языку игры или системы)'),run:function(){swfSetLanguage('auto');self._pages=[];self.main();}},
                {name:'Русский',run:function(){swfSetLanguage('ru');self._pages=[];self.main();}},
                {name:'English',run:function(){swfSetLanguage('en');self._pages=[];self.main();}}
            ]);
        }},
        {name:$gameSystem._universalControlDisabled?TR('Вернуть предмет в инвентарь'):TR('Подготовить удаление мода'),run:function(){
            if($gameSystem._universalControlDisabled){$gameSystem._universalControlDisabled=false;ensureItem();self.sectionSettings(true);return;}
            self.confirm(TR('Удалить служебный предмет?'),TR('Перед удалением верни лимит предметов к обычному и сохрани игру в другой слот.'),function(){
                delete $gameParty._items[ITEM_ID];$gameSystem._universalControlDisabled=true;$gameSystem._universalControlItemCap=0;delete $gameSystem._universalControlReturn;self.close();
            });
        }}
    ],replace);
};
Scene_UniversalControl.prototype.favorites=function(){
    var self=this,battle=!!this._battleMode;
    var categories=[
        {kind:'items',name:TR('Предметы'),go:function(){self.items('items','all','');}},
        {kind:'weapons',name:TR('Оружие'),go:function(){self.items('weapons','normal','');}},
        {kind:'armors',name:TR('Броня и аксессуары'),go:function(){self.items('armors','normal','');}},
        {kind:'skills',name:TR('Навыки'),go:function(){self.favoriteSkillActors();}},
        {kind:'switches',name:TR('Переключатели'),go:function(){self.extraSwitches('');}},
        {kind:'variables',name:TR('Переменные'),go:function(){self.extraVariables('');}}
    ];
    if(!battle)categories.push({kind:'maps',name:TR('Карты'),go:function(){self.maps(false,'');}});
    var rows=categories.map(function(c){return {
        name:c.name+' ★ '+swfFavoriteCount(c.kind),
        help:TR('Избранное хранится в текущем сохранении игры.'),
        run:function(){self._swfOnlyFavorites=self._swfOnlyFavorites||{};self._swfOnlyFavorites[c.kind]=true;self._swfEditingFavorites[c.kind]=false;c.go();}
    };});
    this.showPage(TR('Избранное'),rows);
};
Scene_UniversalControl.prototype.favoriteSkillActors=function(){
    var self=this,rows=$gameParty.allMembers().filter(function(a){return !!a;}).map(function(a){
        return {name:clean(a.name()),run:function(){self.skills(a,false,'');}};
    });
    if(!rows.length)rows.push({name:TR('В отряде нет персонажей'),enabled:false});
    this.showPage(TR('Выбери персонажа для навыков'),rows);
};
Scene_UniversalControl.prototype.savedPositions=function(replace){
    var self=this,rows=[];
    Cheat_Menu.prepare();
    Cheat_Menu.saved_positions.forEach(function(p,i){
        var name=TR('Слот ')+(i+1),filled=p&&p.m>0;
        var info=filled?TR('Карта #')+p.m+' ('+p.x+', '+p.y+')':TR('пусто');
        rows.push({name:name+TR(' · сохранить текущую точку'),help:TR('Перезапишет слот. ')+info,run:function(){
            Cheat_Menu.saved_positions[i]={m:$gameMap.mapId(),x:$gamePlayer.x,y:$gamePlayer.y};
            self.savedPositions(true);
        }});
        rows.push({name:name+TR(' · переместиться · ')+info,enabled:filled,help:TR('Переместиться в сохранённую точку. Не изменяет сюжетные флаги.'),run:function(){
            self.confirm(TR('Переместиться в ')+name+'?',TR('Карта ')+p.m+', '+p.x+', '+p.y,function(){self.teleport(p.m,p.x,p.y,2,true,true);});
        }});
    });
    this.showPage(TR('Сохранённые точки'),rows,replace);
};
Scene_UniversalControl.prototype.partyResources=function(){
    var self=this;
    function groupSet(key,value){
        $gameParty.allMembers().forEach(function(a){if(!a)return;
            if(key==='hp')a.setHp(value==='full'?a.mhp:value);
            if(key==='mp')a.setMp(value==='full'?a.mmp:value);
            if(key==='tp')a.setTp(value==='full'?a.maxTp():value);
        });
        self.notice(TR('Ресурсы группы изменены.'));
    }
    var rows=[{name:TR('Полностью восстановить всю группу'),run:function(){
        $gameParty.allMembers().forEach(function(a){if(a){a.recoverAll();a.setTp(a.maxTp());}});
        self.notice(TR('Группа восстановлена.'));
    }}];
    [['HP','hp'],['MP','mp'],['TP','tp']].forEach(function(entry){
        rows.push({name:TR('Восстановить ')+entry[0]+TR(' до максимума'),run:function(){groupSet(entry[1],'full');}});
        rows.push({name:TR('Установить ')+entry[0]+TR(' группы на 1'),run:function(){groupSet(entry[1],1);}});
        rows.push({name:TR('Установить ')+entry[0]+TR(' группы на 0'),run:function(){groupSet(entry[1],0);}});
    });
    rows.push({name:TR('Снять все состояния с группы'),run:function(){Cheat_Menu.clear_party_states();self.notice(TR('Состояния группы очищены.'));}});
    this.showPage(TR('HP / MP / TP группы'),rows);
};
Scene_UniversalControl.prototype.stackLimits=function(replace){
    var self=this,current=selectedStackLimit();
    var options=[{limit:0,title:TR('Стандартный (как в игре)')},{limit:99,title:TR('99 штук')},{limit:999,title:TR('999 штук')},{limit:9999,title:TR('9999 штук')}];
    var rows=options.map(function(o){return {
        name:(o.limit===current?'✓  ':'    ')+o.title,
        help:o.limit===0?TR('Используется оригинальный предел игры. Уже накопленные большие стопки защищены от удаления при следующей выдаче.'):TR('Ограничение для обычных предметов, оружия и брони.\nНе затрагивает уникальные экземпляры и распознанные специальные ограничения.'),
        run:function(){
            $gameSystem._universalControlItemCap=o.limit;
            self.stackLimits(true);
            self.notice(TR('Лимит: ')+stackLimitLabel()+TR('. Изменение сохраняется при следующем сохранении игры.\nБольшие существующие стопки не уменьшаются автоматически.'));
        }
    };});
    this.showPage(TR('Лимит инвентаря · ')+stackLimitLabel(),rows,replace);
};
// Maps are loaded separately; the current $dataMap is never replaced by this reader.
function readMap(id, callback) {
    if(mapCache[id]){callback(null,mapCache[id]);return;}
    var xhr=new XMLHttpRequest();
    xhr.open('GET','data/Map'+String(id).padZero(3)+'.json');
    xhr.overrideMimeType('application/json');xhr.timeout=15000;
    xhr.onload=function(){
        if(xhr.status>=400){callback(new Error('HTTP '+xhr.status));return;}
        try{var data=JSON.parse(xhr.responseText);if(!Array.isArray(data.data)||!Array.isArray(data.events)||!data.width||!data.height)throw new Error('Invalid map');mapCache[id]=data;callback(null,data);}catch(e){callback(e);}
    };
    xhr.onerror=xhr.ontimeout=function(){callback(new Error(TR('Не удалось прочитать карту')));};xhr.send();
}
function candidatePoint(data,seeds) {
    var w=data.width,h=data.height,tiles=$dataTilesets[data.tilesetId];
    if(!tiles||!Array.isArray(tiles.flags))return null;
    var flags=tiles.flags,blocked={};data.events.forEach(function(e){if(e)blocked[e.x+','+e.y]=true;});
    function pass(x,y,d){
        if(x<0||y<0||x>=w||y>=h)return false;
        var bit=1<<(d/2-1);
        for(var z=3;z>=0;z--){var f=flags[data.data[(z*h+y)*w+x]]||0;if(f&16)continue;return !(f&bit);}
        return false;
    }
    function safe(x,y){
        if(blocked[x+','+y])return false;
        return [[2,0,1],[4,-1,0],[6,1,0],[8,0,-1]].some(function(d){return pass(x,y,d[0])&&pass(x+d[1],y+d[2],10-d[0]);});
    }
    seeds=seeds.concat([[Math.floor(w/2),Math.floor(h/2),2]]);
    for(var i=0;i<seeds.length;i++){
        var seed=seeds[i],cx=Math.max(0,Math.min(w-1,seed[0])),cy=Math.max(0,Math.min(h-1,seed[1]));
        for(var r=0;r<=12;r++)for(var y=Math.max(0,cy-r);y<=Math.min(h-1,cy+r);y++)for(var x=Math.max(0,cx-r);x<=Math.min(w-1,cx+r);x++){
            if(Math.abs(x-cx)+Math.abs(y-cy)!==r)continue;if(safe(x,y))return [x,y,[2,4,6,8].indexOf(seed[2])>=0?seed[2]:2];
        }
    }
    for(var yy=0;yy<h;yy++)for(var xx=0;xx<w;xx++)if(safe(xx,yy))return [xx,yy,2];
    return null;
}
function knownEntrances(id) {
    var result=[];
    var sources=Object.keys(mapCache).map(function(k){return mapCache[k];});
    if($dataMap)sources.push($dataMap);
    sources.forEach(function(data){(data.events||[]).forEach(function(e){if(e)(e.pages||[]).forEach(function(pg){(pg.list||[]).forEach(function(cmd){var p=cmd.parameters;if(cmd.code===201&&p[0]===0&&p[1]===id)result.push([p[2],p[3],p[4]]);});});});});
    if(id===$gameMap.mapId())result.unshift([$gamePlayer.x,$gamePlayer.y,$gamePlayer.direction()]);
    return result;
}
Scene_UniversalControl.prototype.maps=function(visitedOnly,query,replace){
    if(this._battleMode)return;
    var self=this,q=String(query||'').toLowerCase(),visited=$gameSystem._universalControlVisited||{};
    var selected=MAPS.filter(function(m){return (!visitedOnly||visited[m.id])&&(!q||(m.id+' '+m.name+' '+m.internal).toLowerCase().indexOf(q)>=0);});
    var rows=this._swfCatalogRows('maps',selected,function(m){
        return {name:'#'+m.id+' · '+clean(m.name),help:TR('Название карты из базы игры. Список может включать служебные карты.\nДанные и координаты будут прочитаны после выбора.\nПеред телепортом сохранись отдельно.'),run:function(){self.loadMapDetail(m);}};
    },function(v){self.maps(visitedOnly,v,true);},query);
    this.showPage(TR('Телепорт · найдено ')+(rows.length-4),rows,replace);
};
Scene_UniversalControl.prototype.loadMapDetail=function(info){
    var self=this;this._listWindow.deactivate();this._helpWindow.setText(TR('Читаю карту #')+info.id+'…');
    readMap(info.id,function(error,data){
        if(SceneManager._scene!==self)return;
        if(error){self.notice(TR('Карта не прочитана: ')+error.message+TR('. Возможно, игра использует особый формат данных.'));return;}
        var m={id:info.id,name:data.displayName||info.name,width:data.width,height:data.height,point:candidatePoint(data,knownEntrances(info.id))};
        if(data.displayName)info.name=data.displayName;
        self.mapDetail(m);
    });
};
Scene_UniversalControl.prototype.mapDetail=function(m){
    var self=this;this.showPage('#'+m.id+' · '+clean(m.name),[
        {name:TR('Перейти в подобранную точку')+(m.point?' ('+m.point[0]+', '+m.point[1]+')':''),enabled:!!m.point,help:TR('Проходимость рассчитывается по стандартным тайлам.\nПри наличии известных входов выбирается клетка рядом с ними.\nСобытия и нестандартные плагины коллизий могут влиять на переход.'),run:function(){self.confirm(TR('Телепорт: ')+clean(m.name),TR('Перед переходом сохранись в отдельный слот.\nДля возвращения открой это меню через F7.\nТелепорт не устанавливает сюжетные флаги.'),function(){self.teleport(m.id,m.point[0],m.point[1],m.point[2],true,true);});}},
        {name:TR('Указать координаты вручную'),help:TR('Без автоматического смещения. Можно попасть в стену или на событие.'),run:function(){self.ask(TR('Координаты X,Y (X: 0–')+(m.width-1)+', Y: 0–'+(m.height-1)+')',m.point?m.point[0]+','+m.point[1]:'0,0',function(s){var match=s.trim().match(/^(\d+)\s*[,; ]\s*(\d+)$/);if(!match||Number(match[1])>=m.width||Number(match[2])>=m.height){self.notice(TR('Неверные координаты. Введи X,Y в границах карты.'));return;}self.confirm(TR('Ручной телепорт'),TR('В указанной клетке может быть стена или событие.\nF7 → возврат позволит вернуться, если игра продолжает работать.'),function(){self.teleport(m.id,Number(match[1]),Number(match[2]),2,true,false);});});}}
    ]);
};
Scene_UniversalControl.prototype.teleport=function(mapId,x,y,direction,remember,adjust){
    if($gamePlayer.isInVehicle()){this.notice(TR('Сначала выйди из транспорта.'));return;}
    if(remember)$gameSystem._universalControlReturn={mapId:$gameMap.mapId(),x:$gamePlayer.x,y:$gamePlayer.y,direction:$gamePlayer.direction()};
    $gameTemp._universalControlLanding={mapId:mapId,adjust:adjust};
    $gamePlayer.reserveTransfer(mapId,x,y,direction||2,0);SceneManager.goto(Scene_Map);
};
Scene_UniversalControl.prototype.actors=function(){
    var self=this;var rows=$gameParty.allMembers().map(function(a){return {name:clean(a.name())+TR(' · уровень ')+a.level,help:TR('Персонаж из текущего отряда, включая резерв.\nНастройка уровня не меняет сюжетные флаги.'),run:function(){self.actorMenu(a);}};});
    if(!rows.length)rows.push({name:TR('В отряде нет персонажей'),enabled:false});this.showPage(TR('Персонажи отряда'),rows);
};
Scene_UniversalControl.prototype.actorMenu=function(a,replace){
    var self=this;
    var rows=[
        {name:TR('Установить уровень: ')+a.level,help:TR('Опыт выставляется на начало выбранного уровня; классовые навыки сохраняются.'),run:function(){self.askNumber(TR('Уровень: ')+clean(a.name()),a.level,1,a.maxLevel(),function(n){a.changeLevel(n,false);self.actorMenu(a,true);});}},
        {name:TR('Добавить опыт'),run:function(){self.askNumber(TR('Добавить опыт'),1000,0,99999999,function(n){a.gainExp(n);self.actorMenu(a,true);});}},
        {name:TR('Бессмертие: ')+(a.god_mode?TR('ВКЛ'):TR('ВЫКЛ')),help:TR('Бессмертие старого Cheat_Menu. После загрузки сохранения его может потребоваться включить снова.'),run:function(){if(a.god_mode)Cheat_Menu.god_mode_off(a);else Cheat_Menu.god_mode(a);self.actorMenu(a,true);}},
        {name:TR('Установить HP: ')+a.hp+' / '+a.mhp,run:function(){self.askNumber('HP',a.hp,0,a.mhp,function(n){a.setHp(n);self.actorMenu(a,true);});}},
        {name:TR('Установить MP: ')+a.mp+' / '+a.mmp,run:function(){self.askNumber('MP',a.mp,0,a.mmp,function(n){a.setMp(n);self.actorMenu(a,true);});}},
        {name:TR('Установить TP: ')+a.tp+' / '+a.maxTp(),run:function(){self.askNumber('TP',a.tp,0,a.maxTp(),function(n){a.setTp(n);self.actorMenu(a,true);});}},
        {name:TR('Полностью восстановить'),run:function(){a.recoverAll();a.setTp(a.maxTp());self.actorMenu(a,true);}},
        {name:TR('Снять все состояния'),run:function(){Cheat_Menu.clear_actor_states(a);self.actorMenu(a,true);}},
        {name:TR('Изменить бонусы характеристик'),run:function(){self.extraStats(a);}},
        {name:TR('Изучить навык'),run:function(){self.skills(a,false,'');}},
        {name:TR('Забыть изученный навык'),run:function(){self.skills(a,true,'');}}
    ];
    this.showPage(clean(a.name())+TR(' · уровень ')+a.level,rows,replace);
};
Scene_UniversalControl.prototype.skills=function(a,remove,query,replace){
    var self=this,q=String(query||'').toLowerCase();
    var data=$dataSkills.filter(function(skill){return skill&&skill.name&&(!remove||a.isLearnedSkill(skill.id))&&(!q||(skill.id+' '+clean(skill.name)).toLowerCase().indexOf(q)>=0);});
    var rows=this._swfCatalogRows('skills',data,function(skill){
        return {name:'#'+skill.id+' · '+clean(skill.name)+(a.isLearnedSkill(skill.id)?TR(' [изучен]'):''),
            help:clean(skill.description)+'\n'+(remove?TR('Удалить из изученных навыков.'):TR('Изучить напрямую, без траты очков дерева навыков.'))+TR('\nСюжетные, классовые и экипировочные условия использования сохраняются.'),
            run:function(){self.confirm((remove?TR('Забыть: '):TR('Изучить: '))+clean(skill.name),TR('Персонаж: ')+clean(a.name())+'\n'+clean(skill.description),function(){
                if(remove)a.forgetSkill(skill.id);else a.learnSkill(skill.id);
                self.back();self.skills(a,remove,query,true);
                self.notice(remove?TR('Навык удалён из изученных.'):TR('Навык изучен. Для применения могут требоваться класс, оружие или ресурсы.'));
            });}
        };
    },function(v){self.skills(a,remove,v,true);},query);
    this.showPage((remove?TR('Забыть'):TR('Изучить'))+' · '+clean(a.name()),rows,replace);
};
Scene_UniversalControl.prototype.itemCategories=function(){
    var self=this;this.showPage(TR('Выдача предметов'),[
        {name:TR('Обычные предметы'),run:function(){self.items('items','normal','');}},
        {name:TR('Оружие'),run:function(){self.items('weapons','normal','');}},
        {name:TR('Броня и аксессуары'),run:function(){self.items('armors','normal','');}},
        {name:TR('Ключевые и скрытые предметы'),help:TR('Могут участвовать в квестовых проверках. Выдача не завершает квест.'),run:function(){self.items('items','special','');}},
        {name:TR('Все записи базы предметов (включая пустые)'),help:TR('Служебные записи могут не иметь назначения. Для обычной игры используй другие категории.'),run:function(){self.items('items','all','');}}
    ]);
};
function database(kind){return kind==='items'?$dataItems:kind==='weapons'?$dataWeapons:$dataArmors;}
Scene_UniversalControl.prototype.items=function(kind,mode,query,replace){
    var self=this,q=String(query||'').toLowerCase();
    var data=database(kind).slice(0,BASE_COUNTS[kind]).filter(function(i){
        return i&&i.id!==ITEM_ID&&!(i.meta&&i.meta.UniversalControl)&&(mode==='all'||!!i.name)&&
            (kind!=='items'||mode==='all'||(mode==='normal'?i.itypeId===1:i.itypeId!==1))&&
            (!q||(i.id+' '+clean(i.name)).toLowerCase().indexOf(q)>=0);
    });
    var rows=this._swfCatalogRows(kind,data,function(item){
        return {name:'#'+item.id+' · '+(clean(item.name)||TR('[без названия]')),
            help:clean(item.description)+TR('\nВыдача через игровую систему предметов. Лимит: ')+stackLimitLabel()+TR('. Уникальные экземпляры и спецлимиты не меняются.'),
            run:function(){self.giveDialog(item);}};
    },function(v){self.items(kind,mode,v,true);},query);
    this.showPage(TR('Предметы · найдено ')+(rows.length-4),rows,replace);
};
Scene_UniversalControl.prototype.giveDialog=function(item){
    var self=this,independent=DataManager.isIndependent&&DataManager.isIndependent(item);
    if(independent && (typeof $gameParty.numIndependentItems!=='function'||typeof $gameParty.getIndependentItemTypeMax!=='function'||typeof $gameParty.getIndependentItemTypeCur!=='function'||typeof $gameParty.gainIndependentItem!=='function')){this.notice(TR('У этой игры нестандартная система экземпляров предметов. Нужна отдельная адаптация.'));return;}
    var before=independent?$gameParty.numIndependentItems(item):$gameParty.numItems(item);
    var max=independent?Math.max(0,Math.min(50,$gameParty.getIndependentItemTypeMax(item)-$gameParty.getIndependentItemTypeCur(item))):Math.max(0,Math.min(9999,Number($gameParty.maxItems(item))-before));
    if(!isFinite(max)){this.notice(TR('Не удалось определить лимит предмета: нестандартный плагин инвентаря.'));return;}
    if(max<1){this.notice(TR('Достигнут лимит этого предмета или категории экипировки.'));return;}
    this.askNumber(TR('Сколько выдать: ')+(clean(item.name)||'#'+item.id),1,1,max,function(n){
        self.confirm(TR('Выдать ')+n+' × '+(clean(item.name)||'#'+item.id),TR('Квестовые и служебные предметы могут менять результаты проверок.\nПредметы не заменяют прохождение соответствующих событий.'),function(){
            var countBefore=independent?$gameParty.numIndependentItems(item):$gameParty.numItems(item);
            if(independent)$gameParty.gainIndependentItem(item,n,false);else $gameParty.gainItem(item,n,false);
            var countAfter=independent?$gameParty.numIndependentItems(item):$gameParty.numItems(item);
            self.back();self.notice(TR('Добавлено: ')+(countAfter-countBefore)+' × '+(clean(item.name)||'#'+item.id)+'.');
        });
    });
};

// Utilities shared by actor menu and legacy Cheat_Menu.
Scene_UniversalControl.prototype.extraStats=function(a,replace){
    var self=this,names=[TR('Макс. HP'),TR('Макс. MP'),TR('Атака'),TR('Защита'),TR('Маг. атака'),TR('Маг. защита'),TR('Ловкость'),TR('Удача')];
    var rows=names.map(function(name,id){return {name:name+TR(' · бонус ')+a._paramPlus[id],run:function(){
        self.ask(TR('Бонус параметра ')+name+TR(' (целое число)'),String(a._paramPlus[id]),function(v){
            if(!/^-?\d+$/.test(v.trim()) || Math.abs(Number(v))>999999){self.notice(TR('Введи целое число от -999999 до 999999.'));return;}
            a.addParam(id,Number(v)-a._paramPlus[id]);self.extraStats(a,true);
        });
    }};});
    this.showPage(TR('Бонусы · ')+clean(a.name()),rows,replace);
};
Scene_UniversalControl.prototype.extraSwitches=function(query,replace){
    var self=this,q=String(query||'').trim().toLowerCase(),names=$dataSystem.switches||[];
    var data=[];
    names.forEach(function(name,i){if(i>0&&name&&(!q||(String(i)+' '+name).toLowerCase().indexOf(q)>=0))data.push({id:i,name:name});});
    var rows=this._swfCatalogRows('switches',data,function(entry){
        return {name:'#'+entry.id+' '+clean(entry.name)+' · '+($gameSwitches.value(entry.id)?TR('ВКЛ'):TR('ВЫКЛ')),run:function(){
            $gameSwitches.setValue(entry.id,!$gameSwitches.value(entry.id));self._swfRefreshCatalog(function(){self.extraSwitches(query,true);});
        }};
    },function(v){self.extraSwitches(v,true);},query);
    this.showPage(TR('Переключатели · ')+(rows.length-4),rows,replace);
};
Scene_UniversalControl.prototype.extraVariables=function(query,replace){
    var self=this,q=String(query||'').trim().toLowerCase(),names=$dataSystem.variables||[];
    var data=[];
    names.forEach(function(name,i){if(i>0&&name&&(!q||(String(i)+' '+name).toLowerCase().indexOf(q)>=0))data.push({id:i,name:name});});
    var rows=this._swfCatalogRows('variables',data,function(entry){
        return {name:'#'+entry.id+' '+clean(entry.name)+' · '+String($gameVariables.value(entry.id)).slice(0,28),run:function(){
            var value=$gameVariables.value(entry.id);
            self.ask(TR('Новое значение переменной #')+entry.id+' · '+entry.name,String(value),function(v){
                var next=/^-?\d+(?:\.\d+)?$/.test(v.trim())?Number(v):v;
                $gameVariables.setValue(entry.id,next);self._swfRefreshCatalog(function(){self.extraVariables(query,true);});
            });
        }};
    },function(v){self.extraVariables(v,true);},query);
    this.showPage(TR('Переменные · ')+(rows.length-4),rows,replace);
};


// Display the same native control UI *inside* Scene_Battle. Changing scenes
// would reconstruct the battle scene and could reset input/action windows.
var _battleOnItemOk=Scene_Battle.prototype.onItemOk;
Scene_Battle.prototype.onItemOk=function(){
    if(this._itemWindow && itemIsControl(this._itemWindow.item())) {
        this.openUniversalControl();
        return; // Do not consume the item, choose a target or commit an action.
    }
    return _battleOnItemOk.apply(this,arguments);
};
var _battleUpdate=Scene_Battle.prototype.update;
Scene_Battle.prototype.update=function(){
    _battleUpdate.apply(this,arguments);
    if(openRequested && !this._universalControlBattle && !SceneManager.isSceneChanging()){
        openRequested=false;ensureItem();this.openUniversalControl();
    }
};
var _battleProcess=Scene_Battle.prototype.updateBattleProcess;
if (_battleProcess) Scene_Battle.prototype.updateBattleProcess=function(){
    if(this._universalControlBattle)return;
    return _battleProcess.apply(this,arguments);
};
var _battleEnd=Scene_Battle.prototype.terminate;
Scene_Battle.prototype.terminate=function(){
    if(this._universalControlBattle)this.closeUniversalControl(true);
    Cheat_Menu.close_overlay();
    return _battleEnd.apply(this,arguments);
};
Scene_Battle.prototype.openUniversalControl=function(){
    if(this._universalControlBattle || SceneManager.isSceneChanging())return;
    Cheat_Menu.close_overlay();Cheat_Menu.prepare();ensureItem();
    var ui=Object.create(Scene_UniversalControl.prototype);
    ui._battleMode=true;ui._battleScene=this;ui._pages=[];ui._modal=null;
    var oldActive=[];
    if(this._windowLayer && this._windowLayer.children)this._windowLayer.children.forEach(function(w){
        if(w.active){oldActive.push(w);w.deactivate();}
    });
    ui._previousActive=oldActive;
    var dark=new Sprite(new Bitmap(Graphics.width,Graphics.height));
    dark.bitmap.fillAll('#161e2d');dark.opacity=245;
    this.addChildAt(dark,this.getChildIndex(this._windowLayer));
    ui._battleBackground=dark;
    var titleH=72,helpH=144;
    ui._titleWindow=IS_MZ?new Window_Help(new Rectangle(0,0,Graphics.boxWidth,titleH)):new Window_Help(1);
    ui._helpWindow=IS_MZ?new Window_Help(new Rectangle(0,Graphics.boxHeight-helpH,Graphics.boxWidth,helpH)):new Window_Help(3);
    ui._helpWindow.y=Graphics.boxHeight-ui._helpWindow.height;
    ui._listWindow=new Window_UniversalList(ui._titleWindow.height,ui._helpWindow.y-ui._titleWindow.height);
    ui._listWindow.setHelpWindow(ui._helpWindow);
    ui._listWindow.setHandler('choose',ui.choose.bind(ui));
    ui._listWindow.setHandler('cancel',ui.back.bind(ui));
    this.addWindow(ui._titleWindow);this.addWindow(ui._helpWindow);this.addWindow(ui._listWindow);
    this._universalControlBattle=ui;
    ui.main();
};
Scene_Battle.prototype.closeUniversalControl=function(terminating){
    var ui=this._universalControlBattle;
    if(!ui)return;
    this._universalControlBattle=null;
    if(ui._modal && ui._modal.parentNode)ui._modal.parentNode.removeChild(ui._modal);
    [ui._listWindow,ui._helpWindow,ui._titleWindow,ui._battleBackground].forEach(function(obj){
        if(obj && obj.parent) obj.parent.removeChild(obj);
        if(obj && obj.destroy && IS_MZ)obj.destroy({children:true});
    });
    Input.clear();TouchInput.clear();
    if(!terminating)ui._previousActive.forEach(function(w){if(w && w.activate)w.activate();});
};
window.Scene_UniversalControl=Scene_UniversalControl;
})();

})(); // Single-load guard for the entire integrated plugin.
