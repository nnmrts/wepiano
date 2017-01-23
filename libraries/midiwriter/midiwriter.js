// https://github.com/grimmdude/MidiWriterJS
// MIDI reference: https://www.csie.ntu.edu.tw/~r92092/ref/midi/


(function() {
	"use strict";

	var MidiWriter = this.MidiWriter = {
	};

	MidiWriter.constants = {
		HEADER_CHUNK_TYPE  		: [0x4d, 0x54, 0x68, 0x64], // Mthd
		HEADER_CHUNK_LENGTH  	: [0x00, 0x00, 0x00, 0x06], // Header size for SMF
		HEADER_CHUNK_FORMAT0    : [0x00, 0x00], // Midi Type 0 id
		HEADER_CHUNK_FORMAT1    : [0x00, 0x01], // Midi Type 1 id
		HEADER_CHUNK_DIVISION   : [0x00, 0x80], // Defaults to 128 ticks per beat
		TRACK_CHUNK_TYPE		: [0x4d, 0x54, 0x72, 0x6b], // MTrk,
		META_EVENT_ID			: 0xFF,
		META_TEXT_ID			: 0x01,
		META_COPYRIGHT_ID		: 0x02,
		META_TRACK_NAME_ID		: 0x03,
		META_INSTRUMENT_NAME_ID : 0x04,
		META_LYRIC_ID			: 0x05,
		META_MARKER_ID			: 0x06,
		META_CUE_POINT			: 0x07,
		META_TEMPO_ID			: 0x51,
		META_SMTPE_OFFSET		: 0x54,
		META_TIME_SIGNATURE_ID	: 0x58,
		META_KEY_SIGNATURE_ID	: 0x59,
		META_END_OF_TRACK_ID	: [0x2F, 0x00],
		//NOTE_ON_STATUS			: 0x90, // includes channel number (0)
		//NOTE_OFF_STATUS			: 0x80, // includes channel number (0)
		PROGRAM_CHANGE_STATUS	: 0xC0 // includes channel number (0)
	};

	/**
	 * Builds notes object for reference against binary values.
	 * @returns {object}
	 */
	MidiWriter.buildNotesObject = function() {
		var allNotes = [['C'], ['C#','Db'], ['D'], ['D#','Eb'], ['E'],['F'], ['F#','Gb'], ['G'], ['G#','Ab'], ['A'], ['A#','Bb'], ['B']];
		var notesObject = {};
		var counter = 0;

		// All available octaves
		for (var i = -1; i <= 9; i++) {
			for (var j in allNotes) {
				for (var k in allNotes[j]) {
					notesObject[allNotes[j][k] + i] = counter;
				}

				counter++;
			}
		}

		return notesObject;
	};

	// Build with MidiWriter.buildNotesObject
	MidiWriter.constants.notes = MidiWriter.buildNotesObject();

	MidiWriter.Chunk = function(fields) {
		this.type = fields.type;
		this.data = fields.data;
		this.size = [0, 0, 0, fields.data.length];
	};


	MidiWriter.Track = function() {
		this.type = MidiWriter.constants.TRACK_CHUNK_TYPE;
		this.data = [];
		this.size = [];
		this.currentRest = 0;
	};


	/**
	 * Method to add any event type the track.
	 * @param {object} event {data:[]}
	 */
	MidiWriter.Track.prototype.addEvent = function(event) {
		this.data = this.data.concat(event.data);
		this.size = MidiWriter.numberToBytes(this.data.length, 4); // 4 bytes long
	};


	MidiWriter.Track.prototype.setTempo = function(tempo) {
		var event = new MidiWriter.MetaEvent({data: [MidiWriter.constants.META_TEMPO_ID]});
		event.data.push(0x03); // Size
		event.data = event.data.concat([0, 0, tempo]); // Tempo, 3 bytes
		this.addEvent(event);
	};


	MidiWriter.Track.prototype.addText = function(text) {
		var event = new MidiWriter.MetaEvent({data: [MidiWriter.constants.META_TEXT_ID]});
		var stringBytes = MidiWriter.stringToBytes(text);
		event.data = event.data.concat(MidiWriter.numberToVariableLength(stringBytes.length)); // Size
		event.data = event.data.concat(stringBytes); // Text
		this.addEvent(event);
	};


	MidiWriter.Track.prototype.addCopyright = function(text) {
		var event = new MidiWriter.MetaEvent({data: [MidiWriter.constants.META_COPYRIGHT_ID]});
		var stringBytes = MidiWriter.stringToBytes(text);
		event.data = event.data.concat(MidiWriter.numberToVariableLength(stringBytes.length)); // Size
		event.data = event.data.concat(stringBytes); // Text
		this.addEvent(event);
	};


	MidiWriter.Track.prototype.addInstrumentName = function(text) {
		var event = new MidiWriter.MetaEvent({data: [MidiWriter.constants.META_INSTRUMENT_NAME_ID]});
		var stringBytes = MidiWriter.stringToBytes(text);
		event.data = event.data.concat(MidiWriter.numberToVariableLength(stringBytes.length)); // Size
		event.data = event.data.concat(stringBytes); // Text
		this.addEvent(event);
	};


	MidiWriter.Track.prototype.addMarker = function(text) {
		var event = new MidiWriter.MetaEvent({data: [MidiWriter.constants.META_MARKER_ID]});
		var stringBytes = MidiWriter.stringToBytes(text);
		event.data = event.data.concat(MidiWriter.numberToVariableLength(stringBytes.length)); // Size
		event.data = event.data.concat(stringBytes); // Text
		this.addEvent(event);
	};


	MidiWriter.Track.prototype.addCuePoint = function(text) {
		var event = new MidiWriter.MetaEvent({data: [MidiWriter.constants.META_CUE_POINT]});
		var stringBytes = MidiWriter.stringToBytes(text);
		event.data = event.data.concat(MidiWriter.numberToVariableLength(stringBytes.length)); // Size
		event.data = event.data.concat(stringBytes); // Text
		this.addEvent(event);
	};


	MidiWriter.Track.prototype.addLyric = function(lyric) {
		var event = new MidiWriter.MetaEvent({data: [MidiWriter.constants.META_LYRIC_ID]});
		var stringBytes = MidiWriter.stringToBytes(lyric);
		event.data = event.data.concat(MidiWriter.numberToVariableLength(stringBytes.length)); // Size
		event.data = event.data.concat(stringBytes); // Lyric
		this.addEvent(event);
	};

	/** Channel Mode Messages **/
	MidiWriter.Track.prototype.polyModeOn = function() {
		var event = new MidiWriter.NoteOnEvent({data: [0x00, 0xB0, 0x7E, 0x00]});
		this.addEvent(event);
		console.log(event);
	};


	/**	
	 * Wrapper for noteOnEvent/noteOffEvent objects that builds both events.
	 * duration values: 4:quarter, 3:triplet quarter, 2: half, 1: whole
	 * @param {object} fields {pitch: '[C4]', duration: '4', wait: '4', velocity: 1-100}
	 */
	MidiWriter.NoteEvent = function(fields) {
		this.pitch 		= fields.pitch;
		this.wait 		= fields.wait || 0;
		this.duration 	= fields.duration;
		this.sequential = fields.sequential || false;
		this.velocity 	= fields.velocity || 50;
		this.channel 	= fields.channel || 1;
		this.repeat 	= fields.repeat || 1;
		this.data 		= [];

		// Convert velocity to value 0-127
		this.velocity = Math.round(this.velocity / 100 * 127);

		// Need to apply duration here.  Quarter note == MidiWriter.HEADER_CHUNK_DIVISION
		// Rounding only applies to triplets, which the remainder is handled below
		var quarterTicks = MidiWriter.numberFromBytes(MidiWriter.constants.HEADER_CHUNK_DIVISION);
		var tickDuration = Math.round(quarterTicks * this.getDurationMultiplier(this.duration, 'note'));
		var restDuration = Math.round(quarterTicks * this.getDurationMultiplier(this.wait, 'rest'));

		// fields.pitch could be an array of pitches.
		// If so create note events for each and apply the same duration.
		var noteOn, noteOff;
		if (Array.isArray(this.pitch)) {
			// By default this is a chord if it's an array of notes that requires one NoteOnEvent.
			// If this.sequential === true then it's a sequential string of notes that requires separate NoteOnEvents.
			if ( ! this.sequential) {
				// Handle repeat
				for (var j = 0; j < this.repeat; j++) {
					// Note on
					for (var i in this.pitch) {
						if (i == 0) {
							noteOn = new MidiWriter.NoteOnEvent({data: MidiWriter.numberToVariableLength(restDuration).concat([this.getNoteOnStatus(), MidiWriter.constants.notes[this.pitch[i]], this.velocity])});

						} else {
							// Running status (can ommit the note on status)
							noteOn = new MidiWriter.NoteOnEvent({data: [0, MidiWriter.constants.notes[this.pitch[i]], this.velocity]});
							//noteOn = new MidiWriter.NoteOnEvent({data: [0, this.getNoteOnStatus(), MidiWriter.constants.notes[this.pitch[i]], this.velocity]});
						}

						this.data = this.data.concat(noteOn.data);
					}

					// Note off
					for (var i in this.pitch) {
						if (i == 0) {
							noteOff = new MidiWriter.NoteOffEvent({data: MidiWriter.numberToVariableLength(tickDuration).concat([this.getNoteOffStatus(), MidiWriter.constants.notes[this.pitch[i]], this.velocity])});

						} else {
							// Running status (can ommit the note off status)
							noteOff = new MidiWriter.NoteOffEvent({data: [0, MidiWriter.constants.notes[this.pitch[i]], this.velocity]});
							//noteOff = new MidiWriter.NoteOffEvent({data: [0, this.getNoteOffStatus(), MidiWriter.constants.notes[this.pitch[i]], this.velocity]});

						}

						this.data = this.data.concat(noteOff.data);
					}
				}
				

			} else {
				// Handle repeat
				for (var j = 0; j < this.repeat; j++) {
					for (var i in this.pitch) {
						// restDuration only applies to first note
						if (i > 0) {
							restDuration = 0;
						}

						// If duration is 8th triplets we need to make sure that the total ticks == quarter note.
						// So, the last one will need to be the remainder
						if (this.duration === '8t' && i == this.pitch.length - 1) {
							tickDuration = quarterTicks - (tickDuration * 2);
						}

						noteOn = new MidiWriter.NoteOnEvent({data: MidiWriter.numberToVariableLength(restDuration).concat([this.getNoteOnStatus(), MidiWriter.constants.notes[this.pitch[i]], this.velocity])});
						noteOff = new MidiWriter.NoteOffEvent({data: MidiWriter.numberToVariableLength(tickDuration).concat([this.getNoteOffStatus(), MidiWriter.constants.notes[this.pitch[i]], this.velocity])});

						this.data = this.data.concat(noteOn.data.concat(noteOff.data));
					}
				}

			}
		} else {
			noteOn = new MidiWriter.NoteOnEvent({data: MidiWriter.numberToVariableLength(restDuration).concat([MidiWriter.constants.NOTE_ON_STATUS, MidiWriter.constants.notes[this.pitch], this.velocity])});
			noteOff = new MidiWriter.NoteOffEvent({data: MidiWriter.numberToVariableLength(tickDuration).concat([MidiWriter.constants.NOTE_OFF_STATUS, MidiWriter.constants.notes[this.pitch], this.velocity])});

			this.data = noteOn.data.concat(noteOff.data);
		}
	};


	/**
	 * Gets what to multiple ticks/quarter note by to get the specified duration.
	 * Note: type=='note' defaults to quarter note, type==='rest' defaults to 0
	 * @param {string} duration
	 * @param {string} type ['note','rest']
	 */
	MidiWriter.NoteEvent.prototype.getDurationMultiplier = function(duration, type) {
		// Need to apply duration here.  Quarter note == MidiWriter.HEADER_CHUNK_DIVISION
		switch (duration) {
			case '1':
				return 4;
				break;
			case '2':
				return 2;
				break;
			case 'd2':
				return 3;
				break;
			case '4':
				return 1;
				break;
			case 'd4':
				return 1.5;
				break;
			case '8':
				return 0.5;
				break;
			case '8t':
				// For 8th triplets, let's divide a quarter by 3, round to the nearest int, and substract the remainder to the last one.
				return 0.33;
			case 'd8':
				return 0.75;
				break;
			case '16':
				return 0.25;
				break;
			default:
				// Notes default to a quarter
				if (type === 'note') {
					return 1;
				}

				// Rests default to 0
				return 0;
				break;
		}
	};


	/**
	 * Gets the note on status code based on the selected channel. 0x9{0-F}
	 * @returns {number}
	 */
	MidiWriter.NoteEvent.prototype.getNoteOnStatus = function() {
		// Note on at channel 0 is 0x90 (144)
		// 0 = Ch 1
		return 144 + this.channel - 1;
	};


	/**
	 * Gets the note off status code based on the selected channel. 0x8{0-F}
	 * @returns {number}
	 */
	MidiWriter.NoteEvent.prototype.getNoteOffStatus = function() {
		// Note off at channel 0 is 0x80 (128)
		// 0 = Ch 1
		return 128 + this.channel - 1;
	};


	/**	
	 * Holds all data for a "note on" MIDI event
	 * @param {object} fields {data: []}
	 */
	MidiWriter.NoteOnEvent = function(fields) {
		this.data = fields.data;
	};


	/**	
	 * Holds all data for a "note off" MIDI event
	 * @param {object} fields {data: []}
	 */
	MidiWriter.NoteOffEvent = function(fields) {
		this.data = fields.data;
	};


	/**
	 * Holds all data for a program change event.
	 * @param {object} fields {instrument: 1-127}
	 */
	MidiWriter.ProgramChangeEvent = function(fields) {
		// delta time defaults to 0.
		this.data = MidiWriter.numberToVariableLength(0x00).concat([MidiWriter.constants.PROGRAM_CHANGE_STATUS, fields.instrument]);
	};


	MidiWriter.MetaEvent = function(fields) {
		this.data = MidiWriter.numberToVariableLength(0x00);// Start with zero time delta
		this.data = this.data.concat([MidiWriter.constants.META_EVENT_ID].concat(fields.data)); 
	};

	MidiWriter.SysexEvent = function() {

	};


	/**
	 * Object that puts together tracks and provides methods for file output.
	 * @param {object} MidiWriter.Track
	 */
	MidiWriter.Writer = function(tracks) {
		this.data = [];

		var trackType = tracks.length > 1 ? MidiWriter.constants.HEADER_CHUNK_FORMAT1 : MidiWriter.constants.HEADER_CHUNK_FORMAT0;
		var numberOfTracks = MidiWriter.numberToBytes(tracks.length, 2); // two bytes long

		// Header chunk
		this.data.push(new MidiWriter.Chunk({
								type: MidiWriter.constants.HEADER_CHUNK_TYPE, 
								data: trackType.concat(numberOfTracks.concat(MidiWriter.constants.HEADER_CHUNK_DIVISION))}));


		// Track chunks
		for (var i in tracks) {
			tracks[i].addEvent(new MidiWriter.MetaEvent({data: MidiWriter.constants.META_END_OF_TRACK_ID}));
			this.data.push(tracks[i]);
		}
	};

	MidiWriter.Writer.prototype.buildFile = function() {
		var build = [];

		// Data consists of chunks which consists of data
		for (var i in this.data) {
			build = build.concat(this.data[i].type);
			build = build.concat(this.data[i].size);
			build = build.concat(this.data[i].data);
		}

		return build;
	};


	/**
	 * Convert file buffer to a base64 string.  Different methods depending on if browser or node.
	 * 
	 */
	MidiWriter.Writer.prototype.base64 = function() {
		if (typeof btoa === 'function') {
			return btoa(String.fromCharCode.apply(null, this.buildFile()));

		} else {
			return new Buffer(this.buildFile()).toString('base64');
		}
	};


	/**
	 * Translates number of ticks to MIDI timestamp format, returning an array of
	 * hex strings with the time values. Midi has a very particular time to express time,
	 * take a good look at the spec before ever touching this function.
	 * Thanks to https://github.com/sergi/jsmidi
	 *
	 * @param {number} Number of ticks to be translated
	 * @returns {array} of bytes that form the MIDI time value
	 */
	MidiWriter.numberToVariableLength = function(ticks) {
	    var buffer = ticks & 0x7F;

	    while (ticks = ticks >> 7) {
	        buffer <<= 8;
	        buffer |= ((ticks & 0x7F) | 0x80);
	    }

	    var bList = [];
	    while (true) {
	        bList.push(buffer & 0xff);

	        if (buffer & 0x80) { buffer >>= 8; }
	        else { break; }
	    }

	    return bList;
	};

	MidiWriter.stringByteCount = function (s) {
	    return encodeURI(s).split(/%..|./).length - 1;
	};


	/**
	 * Utility function to get an int from an array of bytes.
	 * @param {array} bytes
	 * @returns {number}
	 */
	MidiWriter.numberFromBytes = function(bytes) {
		var hex = '';
		var stringResult;

		for (var i in bytes) {
			stringResult = bytes[i].toString(16);
			
			// ensure string is 2 chars
			if (stringResult.length == 1) {
				stringResult = "0" + stringResult;
			}

			hex += stringResult;
		}

		return parseInt(hex, 16);
	};


	/**
	 * Takes a number and splits it up into an array of bytes.  Can be padded by passing a number to bytesNeeded
	 * @param {number} number
	 * @param {number} bytesNeeded
	 * @returns {array} of bytes
	 */
	MidiWriter.numberToBytes = function(number, bytesNeeded) {
		bytesNeeded = bytesNeeded || 1;

		var hexString = number.toString(16);
		
		if (hexString.length & 1) { // Make sure hex string is even number of chars
			hexString = '0' + hexString;
		}

		// Split hex string into an array of two char elements
		var hexArray = hexString.match(/.{2}/g);

		// Now parse them out as integers
		hexArray = hexArray.map(function(item) {
			return parseInt(item, 16);
		});

		// Prepend empty bytes if we don't have enough
		if (hexArray.length < bytesNeeded) {
			while (bytesNeeded - hexArray.length > 0) {
				hexArray.unshift(0);
			}
		}

		return hexArray;
	};


	MidiWriter.stringToBytes = function(string) {
		var bytes = [];
		for (var i = 0; i < string.length; i++) {
			bytes.push(string[i].charCodeAt(0));
		}

		return bytes;
	};

	// Node support
	if( typeof exports !== 'undefined' ) {
		if( typeof module !== 'undefined' && module.exports ) {
	      exports = module.exports = MidiWriter;
	    }

    	exports.MidiWriterJS = MidiWriter;
  	} 

}).call(this);
