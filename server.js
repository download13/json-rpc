(function() {
	var METHOD_NOT_FOUND = {code: -32601, message: 'Method not found'};
	var PARSE_ERROR = {code: -32700, message: 'Parse error'};


	// Transport is a type described in transports/local.js
	function RPCServer(transport) {
		var self = this;
		this.procs = {};

		transport = transport || require('./transports/local');

		transport.onmessage = function(fromId, message) {
			if(typeof message === 'string') {
				try {
					message = JSON.parse(message);
				} catch(e) {
					cb(wrap(null, PARSE_ERROR));
					return;
				}
			}

			if(!message.method) return; // Only handle requests

			self._handleRequest(message, function(response) {
				transport.send(fromId, response);
			});
		}
	}

	// Subclasses call this to handle an RPC request
	// Takes a request object (or JSON string) and callback
	// callback will be called with a response object
	RPCServer.prototype._handleRequest = function(request, cb) {
		var method = request.method;
		var params = request.params;
		var id = request.id;

		if(!this.procs.hasOwnProperty(method)) {
			cb(wrap(id, METHOD_NOT_FOUND));
			return;
		}

		var proc = this.procs[method];
		var fn = proc.fn;

		if(proc.async) {
			params.push(function(err, r) {
				cb(wrap(id, err || r));
			});
			fn.apply(null, params);
		} else {
			try {
				var r = fn.apply(null, params);
			} catch(e) {
				cb(wrap(id, e));
				return;
			}
			cb(wrap(id, r));
		}
	}

	RPCServer.prototype.register = function(method, fn, async) {
		this.procs[method] = {fn: fn, async: async};
	}

	RPCServer.prototype.unregister = function(method) {
		delete this.procs[method];
	}


	function wrap(id, response) {
		var r = {
			jsonrpc: '2.0',
			id: id
		};

		if(typeof response === 'object' && response.hasOwnProperty('message')) {
			r.error = response;
		} else {
			r.result = response;
		}

		return r;
	}


	try {
		module.exports = RPCServer;
	} catch(e) {
		this.RPCServer = RPCServer;
	}
})();
