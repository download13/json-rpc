(function() {
	var METHOD_NOT_FOUND = {code: -32601, message: 'Method not found'};
	var PARSE_ERROR = {code: -32700, message: 'Parse error'};


	// Extend this class to make a server
	function RPCServer() {
		this.procs = {};
	}

	// Subclasses call this to handle an RPC request
	// Takes a request object (or JSON string) and callback
	// callback will be called with a response object
	RPCServer.prototype.handleCall = function(request, cb) {
		if(typeof request === 'string') {
			try {
				request = JSON.parse(request);
			} catch(e) {
				cb(wrap(null, PARSE_ERROR));
				return;
			}
		}

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


	this.RPCServer = RPCServer;
})();
