var EventEmitter = require('events').EventEmitter;


var hub = new EventEmitter();

// Valid transport class must execute its onmessage function (if it has one)
// whenever a message comes in for us
// Also, ctor takes an id string so we know who we are
function Transport(id) {
	var self = this;
	this.id = id;

	hub.on('rpc', function(fromId, toId, message) {
		if(self.id !== toId) return;

		if(self.onmessage) {
			self.onmessage(fromId, message);
		}
	});
}

// Transport must also have a send method that takes the id of the
// recipient and the message to send them
Transport.prototype.send = function(toId, message) {
	setImmediate(hub.emit.bind(hub, 'rpc', this.id, toId, message));
}


module.exports = Transport;
