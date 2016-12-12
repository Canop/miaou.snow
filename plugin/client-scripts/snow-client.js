miaou(function(gui, locals, plugins, ws){

	var	DONT_REPLAY = false,
		timer,
		LS_PREFIX = "snow.lastFall.";

	plugins.snow = {
		start: function(){
			ws.on('snow.launch', function(snowfall){
				console.log('snowfall:', snowfall);
				if (gui.mobile) {
					if (snowfall.global) return;
					snowfall.options.maxHeightRatio = .03;
					snowfall.options.flakeCount *= .6;
				}
				var localStorageKey = LS_PREFIX + (snowfall.global ? "G" : locals.room.id);
				if (DONT_REPLAY && +localStorage.getItem(localStorageKey) == snowfall.id) {
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
			$(window).keyup(function(){
				clearTimeout(timer);
				$("#snow-canvas").addClass("discreet");
				timer = setTimeout(function(){
					$("#snow-canvas").removeClass("discreet");
				}, 3000);
			});
		}
	}

});
