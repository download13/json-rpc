(function() {
	var TIMEOUT = 500;
	var RESPONSE_TIMEOUT = {code: -32603, message: 'Response timeout'}


	// Extend this class to make an RPC client
	function RPCClient() {
		this.calls = {}; // Pending calls

		// TODO: GC to cull unanswered calls after a time
		this.cull = this.cull.bind(this);
	}

	// Returns the object to be sent
	RPCClient.prototype.call = function(to, method, params, cb) {
		var id = createId();

		this.calls[id] = {
			to: to,
			cb: cb
		};

		// Cull after a while
		setTimeout(this.cull, TIMEOUT, id);

		return {
			jsonrpc: '2.0',
			id: id,
			method: method,
			params: slice.call(arguments, 1)
		};
	}

	// Subclasses call this when a message comes in
	RPCClient.prototype.handle = function(response, from) {
		if(typeof response === 'string') {
			response = JSON.parse(response);
		}

		var id = response.id;

		// Only accept responses from the one you sent the request to
		var to = this.calls[id];
		if(to && to !== from) return;

		delete this.calls[id];

		// TODO Get contents response
	}

	RPCClient.prototype.cull = function(id) {
		var to = this.calls[id];
		delete this.calls[id];

		this.
	}


	// TODO: Extend the class to add a transport, and attach a listener to handle
	function createId() {
		var id = new Uint8Array(16);
		id = slice.call(id).map(function(n) {
			return n.toString(36);
		}).join('');

		return id;
	}
})();
