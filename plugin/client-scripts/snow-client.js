miaou(function(gui, locals, plugins, ws){

	var LS_PREFIX = "snow.lastFall.";

	plugins.snow = {
		start: function(){
			if (gui.mobile) return;
			ws.on('snow.launch', function(snowfall){
				var localStorageKey = LS_PREFIX + (snowfall.global ? "G" : locals.room.id);
				if (+localStorage.getItem(localStorageKey) == snowfall.id) {
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
