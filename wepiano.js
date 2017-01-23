mainfunction = function all($scope, $timeout, $mdSidenav, $mdDialog, $window, $http, $q, $compile, hotkeys) {
	
	// LIBRARIES

	svg4everybody();

	$scope.buildToggler = function (componentId) {
		return function () {
			$mdSidenav(componentId).toggle();
			console.log($mdSidenav(componentId).isOpen());
			if ($mdSidenav(componentId).isOpen() === true) {
				// something
			}
			else {
				// something other
			}
		};
	};

	$scope.toggleLeft = $scope.buildToggler('left');

	$scope.about = function (event) {
		$mdDialog.show(
			$mdDialog.alert()
			.title('About')
			.textContent('a music experiment, just for fun')
			.ariaLabel('about')
			.ok('Cool!')
			.targetEvent(event));
	};

	$scope.doSecondaryAction = function (event) {
		$mdDialog.show(
			$mdDialog.alert()
			.title('Secondary Action')
			.textContent('Secondary actions can be used for one click actions')
			.ariaLabel('Secondary click demo')
			.ok('Neat!')
			.targetEvent(event));
	};

	var originatorEv;

	$scope.openMenu = function ($mdOpenMenu, ev) {
		originatorEv = ev;
		$mdOpenMenu(ev);
	};
	
	NProgress.configure({ parent: '#site' });

	// SMALL FUNCTIONS FOR DEVELOPMENT

	// rounds numbers - value: number to round, exp: how many decimals
	round = function (value, exp) {
		if (typeof exp === 'undefined' || +exp === 0)
			return Math.round(value);

		value = +value;
		exp = +exp;

		if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0))
			return NaN;

		// Shift
		value = value.toString().split('e');
		value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp)));

		// Shift back
		value = value.toString().split('e');
		return +(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp));
	};

	jQuery2html = function (prefix, attribute) {
		allElements = $("*");
		for (var i = 0, n = allElements.length; i < n; ++i) {
			var el = allElements[i];
			if (el.id) {
				$scope[prefix + el[attribute]] = el;
			}
		}
	};

	nthIndex = function (string, char, index) {
		return string.split(char, index).join(char).length;
	};


	findhomepath = function () {
		if (($scope.currentpath.match(/\//g) || []).length > 3) {
			return location.origin + $scope.currentpath.slice(0, nthIndex($scope.currentpath, "/", ($scope.currentpath.match(/\//g) || []).length - 1));
		}
		else {
			return location.origin + $scope.currentpath.slice(0, nthIndex($scope.currentpath, "/", ($scope.currentpath.match(/\//g) || []).length) + 1);
		}
	};

	pathgenerator = function (directory) {
		if (($scope.currentpath.match(/\//g) || []).length > 3) {
			$scope[directory + "path"] = $scope.homepath + "/" + directory + "/";
		}
		else {
			$scope[directory + "path"] = $scope.homepath + directory + "/";
		}
	};

	htmlEntities = function (str) {
		return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	};

	createVariable = function (varName, varContent) {
		var scriptStr = "var " + varName + "= " + varContent + "";

		var nodescriptCode = document.createTextNode(scriptStr);
		var nodescript = document.createElement("script");
		nodescript.type = "text/javascript";
		nodescript.setAttribute("class", "momentscript");
		nodescript.appendChild(nodescriptCode);

		var nodehead = document.getElementsByTagName("head")[0];
		nodehead.appendChild(nodescript);
	};
	
	zeroFill = function (number, width) {
		width -= number.toString().length;
		if (width > 0) {
			return new Array(width + (/\./.test(number) ? 2 : 1)).join("0") + number;
		}
		return number + ""; // always return a string
	};

	capitalizeFirstLetter = function (string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	};

	create = function (htmlStr) {
		var frag = document.createDocumentFragment();
		var temp = document.createElement("div");
		temp.innerHTML = htmlStr;
		while (temp.firstChild) {
			frag.appendChild(temp.firstChild);
		}
		return frag;
	};
	
	cardinandout = function (outel, inel, options = {}) {
		$scope.styles.site = {"overflow": "hidden"};
		$scope.$applyAsync();
		outel.removeClass($scope.animations.slideOutDown).addClass($scope.animations.slideOutDown).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
			outel.hide();
			outel.removeClass($scope.animations.slideOutDown);
			if(options.before) {
				$q.when(options.before()).then(function() {
					inel.show();
					inel.removeClass($scope.animations.slideInUp).addClass($scope.animations.slideInUp).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
						inel.removeClass($scope.animations.slideInUp);
						$scope.styles.site = {"overflow": "overlay"};
						$scope.$apply();
						if(options.callback) {
							options.callback();
						}
					});	
				});
			}
			inel.show();
			inel.removeClass($scope.animations.slideInUp).addClass($scope.animations.slideInUp).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
				inel.removeClass($scope.animations.slideInUp);
				$scope.styles.site = {"overflow": "overlay"};
				$scope.$apply();
				if(options.callback) {
					options.callback();
				}
			});	
		});
	};
	
	cardin = function (inel, options = {}) {
		if(options.before) {
			options.before();
		}
		inel.show();
		inel.removeClass($scope.animations.slideInUp).addClass($scope.animations.slideInUp).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
			inel.removeClass($scope.animations.slideInUp);
			$scope.$apply();
			if(options.callback) {
				options.callback();
			}
		});
	};
	
	cardout = function (outel, options = {}) {
		if(options.before) {
			options.before();
		}
		outel.removeClass($scope.animations.slideOutDown).addClass($scope.animations.slideOutDown).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
			outel.hide();
			outel.removeClass($scope.animations.slideOutDown);
			if(options.callback) {
				options.callback();
			}
		});
	};
	
	scaleconvert = function (value, oldscale, newscale) {
		oldmin = Number(oldscale.slice(0, oldscale.indexOf("-")));
		oldmax = Number(oldscale.slice(oldscale.indexOf("-") + 1));
		newmin = Number(newscale.slice(0, newscale.indexOf("-")));
		newmax = Number(newscale.slice(newscale.indexOf("-") + 1));
		return (((value - oldmin) * (newmax - newmin)) / (oldmax - oldmin)) + newmin;
	};	
	
	$scope.closeDialog = function() {
		$mdDialog.hide();
	};
	
	$scope.showstats = function (event) {
		$mdDialog.show({
			clickOutsideToClose: true,

			scope: $scope,        // use parent scope in template
			preserveScope: true,  // do not forget this if use parent scope

			template: '<md-dialog><md-dialog-content><div id="mapcontainer"></div></md-dialog-content><md-dialog-actions><md-button ng-click="closeDialog()" class="md-primary">AWESOME!</md-button></md-dialog-actions></md-dialog>',
			onComplete: function () {
				$scope.d3init();
			},
		});
	};
	
	//---------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------
	
	
	// APP DATA
	//---------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------

	// DATA THAT WILL NEVER CHANGE THROUGH A SESSION
	//---------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------

	// MANIFEST & VERSION
	$scope.manifest = $.get("manifest.json").done(function () {
		$scope.version = $scope.manifest.responseJSON.version;
		$scope.client_id = $scope.manifest.responseJSON.client_id;
	});
	
	$scope.currenthref = location.href;
	
	$scope.currentpath = location.pathname;

	$scope.homepath = findhomepath();
	
	scope = angular.element("#site").scope();
	
	$scope.animationprefix = "animated ";
	
	$scope.animations = {
		slideOutDown: $scope.animationprefix + "slideOutDown",
		slideInUp: $scope.animationprefix + "slideInUp",
		bounceOutDown: $scope.animationprefix + "bounceOutDown",
		bounceInUp: $scope.animationprefix + "bounceInUp",
		zoomOut: $scope.animationprefix + "zoomOut",
		zoomIn: $scope.animationprefix + "zoomIn",
		pulse: $scope.animationprefix + "pulse"
	}
	
	$.getJSON('//freegeoip.net/json/?callback=?', function(data) {
		geojson = data;
	});
	
	$scope.loadsong = function (options = {}) {
		$scope.songdata = {};
		$scope.songdata = $http.get("song/song.js");
		
		$q.when($scope.songdata, function () {
			$scope.song = $scope.songdata.$$state.value.data;
			if (options.callback) {
				options.callback();
			}
			$scope.lastnoteformatted = moment($scope.song.stats.lastnote).fromNow();
			
			$scope.lengthformatted = numeral($scope.song.notes.length).format('0,0');
			
			$scope.$applyAsync();
		});
		
		$scope.$applyAsync();
	};
	
	slider = document.getElementById('slider');
	
	// DATA THAT WILL CHANGE THROUGH A SESSION
	//---------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------
	
	$scope.octaves = "c1-c3";
	
	$scope.octavearray = [1, 2, 3];
	
	$scope.summand = 0;
	
	hotkeys.bindTo($scope).add({
		combo: 'q',
		description: 'C' + $scope.octavearray[0],
		callback: function() {
			$scope.playnoteonkeyboard('C' + $scope.octavearray[0]);
		}
	}).add({
		combo: '2',
		description: 'Db' + $scope.octavearray[0],
		callback: function() {
			$scope.playnoteonkeyboard('Db' + $scope.octavearray[0]);
		}
	}).add({
		combo: 'w',
		description: 'D' + $scope.octavearray[0],
		callback: function() {
			$scope.playnoteonkeyboard('D' + $scope.octavearray[0]);
		}
	}).add({
		combo: '3',
		description: 'Eb' + $scope.octavearray[0],
		callback: function() {
			$scope.playnoteonkeyboard('Eb' + $scope.octavearray[0]);
		}
	}).add({
		combo: 'e',
		description: 'E' + $scope.octavearray[0],
		callback: function() {
			$scope.playnoteonkeyboard('E' + $scope.octavearray[0]);
		}
	}).add({
		combo: 'r',
		description: 'F' + $scope.octavearray[0],
		callback: function() {
			$scope.playnoteonkeyboard('F' + $scope.octavearray[0]);
		}
	}).add({
		combo: '5',
		description: 'Gb' + $scope.octavearray[0],
		callback: function() {
			$scope.playnoteonkeyboard('Gb' + $scope.octavearray[0]);
		}
	}).add({
		combo: 't',
		description: 'G' + $scope.octavearray[0],
		callback: function() {
			$scope.playnoteonkeyboard('G' + $scope.octavearray[0]);
		}
	}).add({
		combo: '6',
		description: 'Ab' + $scope.octavearray[0],
		callback: function() {
			$scope.playnoteonkeyboard('Ab' + $scope.octavearray[0]);
		}
	}).add({
		combo: 'z',
		description: 'A' + $scope.octavearray[0],
		callback: function() {
			$scope.playnoteonkeyboard('A' + $scope.octavearray[0]);
		}
	}).add({
		combo: '7',
		description: 'Bb' + $scope.octavearray[0],
		callback: function() {
			$scope.playnoteonkeyboard('Bb' + $scope.octavearray[0]);
		}
	}).add({
		combo: 'u',
		description: 'B' + $scope.octavearray[0],
		callback: function() {
			$scope.playnoteonkeyboard('B' + $scope.octavearray[0]);
		}
	}).add({
		combo: 'alt+q',
		description: 'C' + $scope.octavearray[1],
		callback: function() {
			$scope.playnoteonkeyboard('C' + $scope.octavearray[1]);
		}
	}).add({
		combo: 'alt+2',
		description: 'Db' + $scope.octavearray[1],
		callback: function() {
			$scope.playnoteonkeyboard('Db' + $scope.octavearray[1]);
		}
	}).add({
		combo: 'alt+w',
		description: 'D' + $scope.octavearray[1],
		callback: function() {
			$scope.playnoteonkeyboard('D' + $scope.octavearray[1]);
		}
	}).add({
		combo: 'alt+3',
		description: 'Eb' + $scope.octavearray[1],
		callback: function() {
			$scope.playnoteonkeyboard('Eb' + $scope.octavearray[1]);
		}
	}).add({
		combo: 'alt+e',
		description: 'E' + $scope.octavearray[1],
		callback: function() {
			$scope.playnoteonkeyboard('E' + $scope.octavearray[1]);
		}
	}).add({
		combo: 'alt+r',
		description: 'F' + $scope.octavearray[1],
		callback: function() {
			$scope.playnoteonkeyboard('F' + $scope.octavearray[1]);
		}
	}).add({
		combo: 'alt+5',
		description: 'Gb' + $scope.octavearray[1],
		callback: function() {
			$scope.playnoteonkeyboard('Gb' + $scope.octavearray[1]);
		}
	}).add({
		combo: 'alt+t',
		description: 'G' + $scope.octavearray[1],
		callback: function() {
			$scope.playnoteonkeyboard('G' + $scope.octavearray[1]);
		}
	}).add({
		combo: 'alt+6',
		description: 'Ab' + $scope.octavearray[1],
		callback: function() {
			$scope.playnoteonkeyboard('Ab' + $scope.octavearray[1]);
		}
	}).add({
		combo: 'alt+z',
		description: 'A' + $scope.octavearray[1],
		callback: function() {
			$scope.playnoteonkeyboard('A' + $scope.octavearray[1]);
		}
	}).add({
		combo: 'alt+7',
		description: 'Bb' + $scope.octavearray[1],
		callback: function() {
			$scope.playnoteonkeyboard('Bb' + $scope.octavearray[1]);
		}
	}).add({
		combo: 'alt+u',
		description: 'B' + $scope.octavearray[1],
		callback: function() {
			$scope.playnoteonkeyboard('B' + $scope.octavearray[1]);
		}
	}).add({
		combo: 'shift+q',
		description: 'C' + $scope.octavearray[2],
		callback: function() {
			$scope.playnoteonkeyboard('C' + $scope.octavearray[2]);
		}
	}).add({
		combo: 'shift+2',
		description: 'Db' + $scope.octavearray[2],
		callback: function() {
			$scope.playnoteonkeyboard('Db' + $scope.octavearray[2]);
		}
	}).add({
		combo: 'shift+w',
		description: 'D' + $scope.octavearray[2],
		callback: function() {
			$scope.playnoteonkeyboard('D' + $scope.octavearray[2]);
		}
	}).add({
		combo: 'shift+3',
		description: 'Eb' + $scope.octavearray[2],
		callback: function() {
			$scope.playnoteonkeyboard('Eb' + $scope.octavearray[2]);
		}
	}).add({
		combo: 'shift+e',
		description: 'E' + $scope.octavearray[2],
		callback: function() {
			$scope.playnoteonkeyboard('E' + $scope.octavearray[2]);
		}
	}).add({
		combo: 'shift+r',
		description: 'F' + $scope.octavearray[2],
		callback: function() {
			$scope.playnoteonkeyboard('F' + $scope.octavearray[2]);
		}
	}).add({
		combo: 'shift+5',
		description: 'Gb' + $scope.octavearray[2],
		callback: function() {
			$scope.playnoteonkeyboard('Gb' + $scope.octavearray[2]);
		}
	}).add({
		combo: 'shift+t',
		description: 'G' + $scope.octavearray[2],
		callback: function() {
			$scope.playnoteonkeyboard('G' + $scope.octavearray[2]);
		}
	}).add({
		combo: 'shift+6',
		description: 'Ab' + $scope.octavearray[2],
		callback: function() {
			$scope.playnoteonkeyboard('Ab' + $scope.octavearray[2]);
		}
	}).add({
		combo: 'shift+z',
		description: 'A' + $scope.octavearray[2],
		callback: function() {
			$scope.playnoteonkeyboard('A' + $scope.octavearray[2]);
		}
	}).add({
		combo: 'shift+7',
		description: 'Bb' + $scope.octavearray[2],
		callback: function() {
			$scope.playnoteonkeyboard('Bb' + $scope.octavearray[2]);
		}
	}).add({
		combo: 'shift+u',
		description: 'B' + $scope.octavearray[2],
		callback: function() {
			$scope.playnoteonkeyboard('B' + $scope.octavearray[2]);
		}
	});

	// BUTTONS
	$scope.buttons = {
		stats: {
			text: "statistics"
		},
		highlow: {
			text: "higher"
		},
		playpause: {
			text: "play song"
		},
		stop: {
			text: "stop"
		}
	};

	// STYLES
	$scope.styles = {
		loadingcontainer: {
			"display": "none"
		},
		site: {
			"overflow": ""
		},
		top: {
			"top": ""
		},
		optionscontainer: {
			"top": ""
		},
		info: {
			"top": ""
		},
		stats: {
			"top": ""
		},
		highlow : {
			"margin-bottom": "-20px"
		},
		playpause: {
			"top": ""
		},
		stop: {
			"top": ""
		}
	};
	
	// UI FUNCTIONS
	$scope.ui = {
		newtab: function () {
			$scope.url = {
				github: 'https://github.com/nnmrts/wepiano',
				impressum: 'https://www.pumpn.net/impressum.html'
			};
		},
		highlow: function () {
			$scope.switchoctaves();
		},
		playpause: function () {
			$scope.playpause();
		},
		stop: function () {
			$scope.stop();
		}
	};
	
	jQuery2html("html_", "id");

	$(document).ready(function () {
		$("#donate").click(function () {
			donate();
		});
	});

	$(document).ready(function () {
		$("#about").click(function () {
			about();
		});
	});

	$scope.base64prefix = "data:audio/midi;base64,";

	$scope.array2midi = function () {
		i = 0;
		$scope.song.keys = [];

		loop = function () {
			if (i < $scope.song.notes.length) {
				$scope.song.keys.push(MIDI.noteToKey[$scope.song.notes[i]]);

				i = i + 1;
				loop();
			} 
			else {
				track = new MidiWriter.Track();

				note = new MidiWriter.NoteEvent({
					pitch: $scope.song.keys,
					duration: '4',
					sequential: true,
					velocity: 100
				});
				track.addEvent(note);

				write = new MidiWriter.Writer([track]);
				$scope.song.base64 = $scope.base64prefix + write.base64();
			}
		};

		loop();
	};

	window.onload = function () {
		MIDI.loadPlugin({
			soundfontUrl: "libraries/midi-js-soundfonts/FluidR3_GM/",
			instrument: "acoustic_grand_piano",
			onsuccess: function () {
				player = MIDI.Player;
				player.timeWarp = 0.4;
				MIDI.setVolume(0, 127);
				delay = 0; // play one note every quarter second
				velocity = 127; // how hard the note hits
				
				player.loadFile($scope.song.base64);
				
				noUiSlider.create(slider, {
					start: [0],
					connect: [true, false],
					range: {
						'min': 0,
						'max': player.endTime
					}
				});
				
				wasplaying = false;
				
				slider.noUiSlider.on('start', function(){
					if (player.playing) {
						player.pause();
						wasplaying = true;
					}
				});
				
				slider.noUiSlider.on('change', function(values){
					if (player.playing) {
						player.pause();
						wasplaying = true;
						player.currentTime = Number(values[0]);
						player.resume();
						console.log(values);
					}
					else {
						player.currentTime = Number(slider.noUiSlider.get());
					}
				});
				
				slider.noUiSlider.on('end', function(){
					if (wasplaying) {
						wasplaying = false;
						player.currentTime = Number(slider.noUiSlider.get());
						player.resume();
					}
					else {
						player.currentTime = Number(slider.noUiSlider.get());
					}
				});
				
				player.addListener(function(data) {
					if (data.now == data.end) {
						$scope.stop();
						slider.noUiSlider.set(0);
					}
					else {
						slider.noUiSlider.set(data.now);
					}
				});
				
				$scope.displaynotes();
			}
		});
		
		
	};
		
		
		$scope.displaynotes = function () {
			$("#notes")[0].innerHTML = "";
					notesdiv = document.createElement('div');
					notesdiv.style.height = "50px";
					
					i = 0;
					
					$scope.song.notes.forEach(function(item){
						
						notediv = document.createElement('div');
						height = scaleconvert(item, "24-95", "10-70");
						notediv.style.height = height + "%";
						width = 200 / $scope.song.notes.length;
						notediv.style.width = width + "%";
						notesdiv.appendChild(notediv);
					});
					
					$("#notes")[0].appendChild(notesdiv);
				};
	
	$scope.switchoctaves = function() {
		i = 0;
		
		if ($scope.octaves === "c1-c3") {
			$scope.summand = 36;
			$scope.octaves = "c4-c6";
			$scope.octavearray = [4, 5, 6];
			$scope.buttons.highlow.text = "lower";
		}
		else {
			$scope.summand = 0;
			$scope.octaves = "c1-c3";
			$scope.octavearray = [1, 2, 3];
			$scope.buttons.highlow.text = "higher";
		}
	};
	
	$scope.createcountryobject = function () {
		countryobject = {};
		
		testdatamap = new Datamap({element: document.getElementById("datamaphider")});
		
		i = 0;
		
		while (i < 178) {
			countryobject[testdatamap.worldTopo.objects.world.geometries[i].properties.name] = testdatamap.worldTopo.objects.world.geometries[i].id;
			i = i + 1;
			while ($("#datamaphider")[0].firstElementChild) {
				$("#datamaphider")[0].removeChild($("#datamaphider")[0].firstElementChild);
			}
		}
	};

	$scope.playpause = function () {
		if (player.currentTime == player.endTime) {
			player.currentTime = 0;
		}
		
		
		if (player.playing) {
			$("[md-svg-icon=play]").show();
			$("[md-svg-icon=pause]").hide();
			player.pause();
		}
		else {
			$("[md-svg-icon=pause]").show();
			$("[md-svg-icon=play]").hide();
			
			if (player.currentTime > 0) {
				player.resume();
			}
			else {
				
				$scope.array2midi();
				player.loadFile($scope.song.base64);
				player.start();
			}
		}
	};
	
	$scope.stop = function () {
		if (player.playing) {
			$("[md-svg-icon=play]").show();
			$("[md-svg-icon=pause]").hide();
		}
		
		player.currentTime = 0;
		
		slider.noUiSlider.set(0);
		
		player.stop();
		
		slider.noUiSlider.set(0);
		
		player.currentTime = 0;
	};
	
	$scope.playnote = function($event) {
		note = Number($event.currentTarget.attributes.note.nodeValue) + $scope.summand;
		
		MIDI.setVolume(0, 127);
		MIDI.noteOn(0, note, velocity, delay);
		MIDI.noteOff(0, note, delay + 0.2);
		
				$scope.song.notes.push(note);
				console.log(MIDI.noteToKey[note]);
				if ($scope.song.stats.locations[geojson.country_name]) {
					$scope.song.stats.locations[geojson.country_name] = $scope.song.stats.locations[geojson.country_name] + 1;
				}
				else {
					$scope.song.stats.locations[geojson.country_name] = 1;
				}
				$scope.array2midi();
				$scope.savesong();
	};
	
	$scope.playnoteonkeyboard = function(key) {
		note = MIDI.keyToNote[key];
		
		MIDI.setVolume(0, 127);
		MIDI.noteOn(0, note, velocity, delay);
		MIDI.noteOff(0, note, delay + 0.2);
	
				$scope.song.notes.push(note);
				console.log(MIDI.noteToKey[note]);
				if ($scope.song.stats.locations[geojson.country_name]) {
					$scope.song.stats.locations[geojson.country_name] = $scope.song.stats.locations[geojson.country_name] + 1;
				}
				else {
					$scope.song.stats.locations[geojson.country_name] = 1;
				}
				$scope.array2midi();
				$scope.savesong();
	};
	
	$scope.savesong = function() {
		if (player.playing) {
			player.pause();
			wasplaying = true;
		}
		player.loadFile($scope.song.base64);
		if (wasplaying) {
			wasplaying = false;
			player.currentTime = Number(slider.noUiSlider.get());
			player.resume();
		}
		else {
			player.currentTime = Number(slider.noUiSlider.get());
		}
		$scope.song.stats.lastnote = $.now();
		phpsong = new FormData();
		phpsong.append("phpsong", JSON.stringify($scope.song));
		if (window.XMLHttpRequest) {
			xhr = new XMLHttpRequest()
		}
		else {
			xhr = new activeXObject("Microsoft.XMLHTTP");
		}
		xhr.open('post', 'savesong.php', true);
		xhr.send(phpsong);
		console.log("SONG SAVED ON SERVER");
		
		slider.noUiSlider.updateOptions({
			range: {
				'min': 0,
				'max': player.endTime
			}
		});
	};
	
	$scope.d3init = function () {
		$scope.createcountryobject();
		
		$scope.locationarray = $.map($scope.song.stats.locations, function(value, key, index) {
			return [[countryobject[key], value]];
		});
		// Datamaps expect data in format:
		// { "USA": { "fillColor": "#42a844", numberOfWhatever: 75},
		//   "FRA": { "fillColor": "#8dc386", numberOfWhatever: 43 } }
		dataset = {};

		// We need to colorize every country based on "numberOfWhatever"
		// colors should be uniq for every value.
		// For this purpose we create palette(using min/max series-value)
		onlyValues = $scope.locationarray.map(function(obj){ return obj[1]; });
		minValue = Math.min.apply(null, onlyValues),
				maxValue = Math.max.apply(null, onlyValues);

		// create color palette function
		// color can be whatever you wish
		paletteScale = d3.scale.linear()
				.domain([minValue,maxValue])
				.range(["#FFFFFF","#6056EA"]);

		// fill dataset in appropriate format
		$scope.locationarray.forEach(function(item){ //
			// item example value ["USA", 70]
			iso = item[0],
			value = item[1];
			dataset[iso] = { numberOfThings: value, fillColor: paletteScale(value) };
		});

		// render map
		datamap1 = new Datamap({
			element: document.getElementById("mapcontainer"),
			projection: 'mercator', // big world map
			// countries don't listed in dataset will be painted with this color
			fills: { defaultFill: '#F5F5F5' },
			data: dataset,
			geographyConfig: {
				borderColor: '#DEDEDE',
				highlightBorderWidth: 2,
				// don't change color on mouse hover
				highlightFillColor: function(geo) {
					return geo['fillColor'] || '#F5F5F5';
				},
				// only change border
				highlightBorderColor: '#B7B7B7',
				// show desired information in tooltip
				popupTemplate: function(geo, data) {
					// don't show tooltip if country don't present in dataset
					if (!data) { return ; }
					// tooltip content
					return ['<div class="hoverinfo">',
						'<strong>', geo.properties.name, '</strong>',
						'<br>Notes: <strong>', data.numberOfThings, '</strong>',
						'</div>'].join('');
				}
			}
		});
	};
	
	
	// SERVER SENT EVENTS
	//---------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------
	sse = $.SSE('live.php', {
		onMessage: function(message){
			$scope.song = JSON.parse(message.data);
			$scope.array2midi();
			$scope.lastnoteformatted = moment($scope.song.stats.lastnote).fromNow();
			$scope.lengthformatted = numeral($scope.song.notes.length).format('0,0');
			$scope.displaynotes();
			$scope.$applyAsync();
		}
	});

	sse.start();
};

// ANGULARJS

array = ["$scope", "$timeout", "$mdSidenav", "$mdDialog", "$window", "$http", "$q", "$compile", "hotkeys", mainfunction];

var wepiano = angular.module('wepiano', ['ngMaterial', 'ngMessages', 'material.svgAssetsCache', 'cfp.hotkeys', 'ngSanitize']);

wepiano.config(["$mdIconProvider", "$qProvider", function ($mdIconProvider, $qProvider) {
	$mdIconProvider.defaultIconSet('libraries/mdi/svg/mdi.svg');
	$qProvider.errorOnUnhandledRejections(false);
}]);

wepiano.controller("all", array);