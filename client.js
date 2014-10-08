(function() {
	var TIMEOUT = 500;
	var RESPONSE_TIMEOUT = {code: -32603, message: 'Response timeout'}




	// Extend this class to make an RPC client
	function RPCClient() {
		this.calls = {}; // Pending calls

		// TODO: GC to cull unanswered calls after a time
		this.cull = this.cull.bind(this);
	}

	// Creates a JSON-RPC request object
	RPCClient.prototype.createRequest = function(method, params, cb) {
		var id = createId();

		this.calls[id] = cb;

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
	RPCClient.prototype.handleResponse = function(response) {
		if(typeof response === 'string') {
			response = JSON.parse(response);
		}

		// Filter out requests, we don't handle those
		if(response.method || response.params) return;

		var id = response.id;

		// Filter out responses whose ids aren't on file
		if(!this.call.hasOwnProperty(id)) return;

		var cb = this.calls[id]; // Get and delete callback
		delete this.calls[id];

		cb();
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

	var RPC = {};

	function createRequest(method, params) {}
})();
