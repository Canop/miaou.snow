//
const	auths = require('../../libs/auths.js'),
	MIN_DELAY = 50,
	lastSnowfallPerRoom = new Map; // map roomId -> fall info (0 as key for global)

var	miaou,
	nextSnowfallId = Date.now();

exports.init = function(_miaou){
	miaou = _miaou;
}

function rnd(min, max){
	if (max === undefined) {
		max = min;
		min = 0;
	}
	return min + Math.random()*(max-min);
}

function stringToOptions(str){
	var	tokens = new Set(str.toLowerCase().split(/[,\s]+/)),
		options = {};
	console.log('tokens:', tokens);
	if (tokens.has("big")) options.maxRadius = 2.2;
	else if (tokens.has("small")) options.maxRadius = 1.2;
	if (tokens.has("light")) options.flakeCount = 50;
	else if (tokens.has("heavy")) options.flakeCount = 1000;
	if (tokens.has("wind")) options.wind = rnd(-3, 3);
	if (tokens.has("sticky")) options.stickingRatio = .55;
	if (tokens.has("blizzard")) {
		options.wind = rnd(-8, 8);
		options.flakeCount = rnd(2500, 5000) |0;
	}
	var m = str.match(/#[0-9a-f]{3,8}\b/i);
	if (m) options.color = m[0];
	return options;
}

var launch = exports.launch = function(roomId, user, args, isServerAdmin){
	var global = /\bglobal\b/.test(args);
	if (global && !isServerAdmin) {
		throw "Only a server admin can manage global snow falls";
	}
	var sockets = miaou.io.sockets;
	if (!global) sockets = sockets.in(roomId);
	var infoKey = global ? 0 : roomId;
	if (/\bstop\b/i.test(args)) {
		console.log("snow stops in room", roomId);
		lastSnowfallPerRoom.delete(infoKey);
		sockets.emit("snow.stop");
		return;
	}
	console.log("snow starts in room", roomId);
	var snowfall = {
		id: nextSnowfallId++,
		sent: Date.now()/1000,
		author: user.name,
		global: global,
		options: stringToOptions(args)
	};
	var lastSnowfall = lastSnowfallPerRoom.get(infoKey);
	if (lastSnowfall && (lastSnowfall.sent+MIN_DELAY>snowfall.sent)) {
		throw "Min delay between two snowfalls: " + MIN_DELAY + " seconds";
	}
	lastSnowfallPerRoom.set(infoKey, snowfall);
	sockets.emit("snow.launch", snowfall);
}

function onCommand(ct){
	ct.silent = true;
	ct.nostore = true;
	launch(ct.shoe.room.id, ct.shoe.publicUser, ct.args, auths.isServerAdmin(ct.shoe.completeUser));
}

function onBotCommand(cmd, args, bot, m){
	launch(m.room, bot, args, false); // TODO make it a silent message
}

exports.registerCommands = function(cb){
	cb({
		name: 'snow',
		fun: onCommand,
		botfun:onBotCommand,
		help: "like rain but prettier",
		detailedHelp: "Exemples:\n"+
			"`!!snow heavy`\n"+
			"`!!snow big`\n"+
			"`!!snow light wind sticky`\n"+
			"`!!snow blizzard`\n"+
			"`!!snow wind big sticky`\n"+
			"Other possible uses can be found by those who know how to search."
	});
}

exports.onNewShoe = function(shoe){
	setTimeout(function(){
		if (!shoe.room) {
			console.log("snowfall: no room in shoe");
			return;
		}
		var snowfall = lastSnowfallPerRoom.get(shoe.room.id) || lastSnowfallPerRoom.get(0);
		if (snowfall) shoe.emit("snow.launch", snowfall);
	}, 3000);
}
