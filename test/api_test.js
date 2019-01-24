var app = require('../index');
var assert = require('assert');
var http = require('http');
var config = require('../config/config');

// container for tests
var api = {};

// helpers
var helpers = {};

helpers.makeGetRequest = (path, callback) => {
    var requestDetails = {
        'protocol' : 'http:',
        'hostname' : 'localhost',
        'port' : config.httpPort,
        'method' : 'GET',
        'path' : path,
        'headers' : {
            'Content-Type' : 'application/json'
        }
    };

    // send the request
    var req = http.request(requestDetails, (response) => {
        callback(response);
    })
    req.end();
};

// Create unit tests for the above functions
api['app.init should start without throwing error'] = (done) => {
    assert.doesNotThrow(() => {
        app.init((error) => {
            done();
        });
    }, TypeError);
};

// make a request to /ping
api['/ping should repsond to GET with 200'] = (done) => {
    helpers.makeGetRequest('/ping', (res) => {
        assert.equal(res.statusCode, 200);
        done();
    });
};

// make a request to /api/users
api['/api/users should repsond to GET with 400'] = (done) => {
    helpers.makeGetRequest('/api/users', (res) => {
        assert.equal(res.statusCode, 400);
        done();
    });
};

// make a request to a random path
api['a random path should repsond to GET with 404'] = (done) => {
    helpers.makeGetRequest('/api/random/path', (res) => {
        assert.equal(res.statusCode, 404);
        done();
    });
};

// export the tests to the runner
module.exports = api;