(function() {
	var slice = [].slice;

	var DEFAULT_TIMEOUT = 500;
	var RESPONSE_TIMEOUT = {code: -32603, message: 'Response timeout'};


	function RPCClient(transport, opts) {
		var self = this;
		// TODO: Option for auto-retry
		this.calls = {}; // Pending calls

		opts = opts || {};
		this.doCull = opts.cull !== false;
		this.timeout = opts.timeout || DEFAULT_TIMEOUT;

		// TODO: GC to cull unanswered calls after a time
		this.cull = this.cull.bind(this);
		this.abort = this.abort.bind(this);

		this.transport = transport;

		transport.onmessage = function(fromId, message) {
			if(typeof message === 'string') {
				message = JSON.parse(message);
			}

			// Filter out requests, we don't handle those
			if(message.method || message.params) return;

			self.handleResponse(message);
		}
	}

	// Creates a JSON-RPC request object
	RPCClient.prototype.call = function(toId, method, params, cb) {
		var requestId = createId();

		this.calls[requestId] = cb;

		// Cull after a while
		if(this.doCull) {
			setTimeout(this.cull, this.timeout, requestId);
		} else {
			setTimeout(this.abort, this.timeout, requestId);
		}

		this.transport.send(toId, {
			jsonrpc: '2.0',
			id: requestId,
			method: method,
			params: params
		});

		return requestId;
	}

	RPCClient.prototype.abort = function(requestId) {
		delete this.calls[requestId];
	}

	RPCClient.prototype.cull = function(requestId) {
		var cb = this.calls[requestId];
		if(!cb) return;

		this.abort();

		// TODO: Send back an error? option
		this.handleResponse({
			id: requestId,
			error: RESPONSE_TIMEOUT
		});
	}

	// Subclasses call this when a message comes in
	RPCClient.prototype.handleResponse = function(response) {
		var requestId = response.id;

		// Filter out responses whose ids aren't on file
		if(!this.calls.hasOwnProperty(requestId)) return;

		var cb = this.calls[requestId]; // Get and delete callback
		delete this.calls[requestId];

		cb(response.error, response.result);
	}


	function createId() {
		var id = '';

		for(var i = 0; i < 12; i++) {
			var v = Math.floor(255 * Math.random());
			id += v.toString(36);
		}

		return id;
	}

	function createRequest(method, params) {}


	try {
		module.exports = RPCClient;
	} catch(e) {
		this.RPCClient = RPCClient;
	}
})();
