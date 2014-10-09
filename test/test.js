var assert = require('assert');
var uuid = require('uuid');

var RPCServer = require('../server');
var RPCClient = require('../client');
var LocalTransport = require('../transports/local');


var id1 = 'id1';
var id2 = 'id2';
var client, server;

describe('Server and Client', function() {
	it('Client can be instantiated', function() {
		client = new RPCClient(new LocalTransport(id1));
	});

	it('Server can be instantiated', function() {
		server = new RPCServer(new LocalTransport(id2));
	});

	it('can register handlers', function() {
		server.register('add', function(n1, n2) {
			return n1 + n2;
		});
	});

	it('can handle calls', function(done) {
		client.call(id2, 'add', [4, 9], function(err, response) {
			assert.equal(response, 13);
			done();
		});
	});

	it('can register async handlers', function() {
		server.register('wait', function(ms, cb) {
			setTimeout(cb, ms);
		}, true);
	});

	it('can handle async calls', function(done) {
		var waited = false;

		client.call(id2, 'wait', [60], function() {
			assert(waited);
			done();
		});

		setTimeout(function() {
			waited = true;
		}, 50);
	});

	it('gets back timeout error to long async call', function(done) {
		var waited = false;

		// Wait a little over the default timeout
		client.call(id2, 'wait', [520], function(err) { // Comes back after <timeout> ms (500)
			assert.equal(err.code, -32603); // Response timeout
			assert(!waited); // Still 500, not 510
			done();
		});

		setTimeout(function() {
			waited = true;
		}, 510);
	});

	it('returns error on call to never-registered handler', function(done) {
		var called = false;

		client.call(id2, 'subtract', [], function(err) {
			if(err.code === -32601) called = true;
		});

		setTimeout(function() {
			if(called) {
				done();
			} else {
				done(new Error('no error'));
			}
		}, 60);
	});

	it('can unregister handlers', function() {
		server.unregister('add');
		// TODO Unregister add
	});

	it('returns error on call to unregistered handler', function(done) {
		var called = false;

		client.call(id2, 'add', [1, 1], function(err) {
			if(err.code === -32601) called = true;
		});

		setTimeout(function() {
			if(called) {
				done();
			} else {
				done(new Error('no error'));
			}
		}, 60);
	});
});
