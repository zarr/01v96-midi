var midi = require('midi');
var _ = require('lodash');

console.log('starting up');

// Set up a new input.
var input = new midi.input();

// Count the available input ports.
input.getPortCount();

// Get the name of a specified input port.
input.getPortName(0);

var channels = [];
var status = false;

// Configure a callback.
input.on('message', function(deltaTime, message) {
  // The message is an array of numbers corresponding to the MIDI bytes:
  //   [status, data1, data2]
  // https://www.cs.cf.ac.uk/Dave/Multimedia/node158.html has some helpful
  // information interpreting the messages.
  message = _.map(message, function (d) {
  	var str = d.toString(16).toUpperCase();
  	return "00".substring(str.length) + str
  });
  if ('F043103E7F' == message.slice(0,5).join("")) { // this is a "General purpose digital mixer parameter change"
  	message = message.splice(5);
    // console.log('m:' + message);
    if (message[1] == '1A') {
    	channels[parseInt(message[3], 16)] = message[7] == "01" ? true : false;
    }
    // console.log(channels.slice(0, 4));
    if (_.some(channels.slice(0, 4))) {
    	if (!status) {
    		status = true;
	    	console.log("ON!");
    	}
    } else {
    	if (status) {
    		status = false;
		    console.log("OFF!");
		}
    }
  }
});

// Open the first available input port.
input.openPort(0);

// Sysex, timing, and active sensing messages are ignored
// by default. To enable these message types, pass false for
// the appropriate type in the function below.
// Order: (Sysex, Timing, Active Sensing)
// For example if you want to receive only MIDI Clock beats
// you should use
// input.ignoreTypes(true, false, true)
input.ignoreTypes(false, true, true);

// ... receive MIDI messages ...

// Close the port when done.
//input.closePort();


// Set up a new output.
var output = new midi.output();

// Count the available output ports.
output.getPortCount();

// Get the name of a specified output port.
output.getPortName(0);

// Open the first available output port.
output.openPort(0);

// Send a MIDI message.
var requests = [
	['F0', '43', '30', '3E', '7F', '01', '1A', '00' , '00', 'F7'],
	['F0', '43', '30', '3E', '7F', '01', '1A', '00' , '01', 'F7'],
	['F0', '43', '30', '3E', '7F', '01', '1A', '00' , '02', 'F7'],
	['F0', '43', '30', '3E', '7F', '01', '1A', '00' , '03', 'F7'],
];
_.forEach(requests, function (request) {
	output.sendMessage(_.map(request, function (d) {
		return parseInt(d, 16);
	}));
});

// Close the port when done.
output.closePort();