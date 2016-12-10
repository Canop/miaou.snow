miaou(function(gui, locals, plugins, ws){

	var	DONT_REPLAY = false,
		LS_PREFIX = "snow.lastFall.";

	plugins.snow = {
		start: function(){
			ws.on('snow.launch', function(snowfall){
				if (gui.mobile && snowfall.global) return;
				var localStorageKey = LS_PREFIX + (snowfall.global ? "G" : locals.room.id);
				if (DONT_REPLAY && +localStorage.getItem(localStorageKey) == snowfall.id) {
					console.log("already played:", snowfall);
					return;
				}
				window.snow.start(snowfall.options);
				storageTimer = setTimeout(function(){
					localStorage.setItem(localStorageKey, snowfall.id);
				}, 9000);
			});
			ws.on('snow.stop', function(snowfall){
				window.snow.stop();
			});

		}
	}

});
