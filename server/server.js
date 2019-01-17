const url = require('url');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const config = require('../config/config.js');
const StringDecoder = require('string_decoder').StringDecoder;
const handlers = require('../lib/handlers');
const helpers = require('../lib/helpers');
const util = require('util');
const debug = util.debuglog('server');
// debug logs will appear only when we debug in server node
// NODE_DEBUG=server node index.js

// Instantiate the server
var server = {};

// Server logic for both 'http' and 'https' servers
server.unifiedServer = (req,res) => {

    // get url and parse it
    var parsedUrl = url.parse(req.url,true);

    // get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');

    // get query string as an object
    var queryStringObject = parsedUrl.query;

    // get http method
    var method = req.method.toLowerCase();

    // get headers as an object
    var headers = req.headers;

    // get the payload if any
    var decoder = new StringDecoder('utf-8')
    var buffer = '';

    // request on event 'data' calls the callback function
    req.on('data',function(data){
        buffer += decoder.write(data);
    });
    req.on('end', function(){
        buffer += decoder.end();

        // choose handler this request should go to
        var chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound; 

        // construct data object to send to the handler
        var data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : helpers.parseJsonToObject(buffer)
        };

        // route the request to the handler specified in the router
        chosenHandler(data, function(statusCode, payload) {
            // use the statusCode called back by the handler or use the default
            statusCode = typeof(statusCode) === 'number' ? statusCode : 200;

            // use the payload called back by the handler or use the default
            payload = typeof(payload) === 'object' ? payload : {};

            // convert the payload to the string
            var payloadString = JSON.stringify(payload);
            
            // return the response
            res.setHeader('Content-Type','application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            // { 32:green, 31:red }
            if(statusCode == 200){
                debug('\x1b[32m%s\x1b[0m', 'Returning response : ',statusCode, payloadString);
            }else {
                debug('\x1b[31m%s\x1b[0m', 'Returning response : ',statusCode, payloadString);
            }
        });

    });
}

// Instantiate the HTTP server
server.httpServer = http.createServer(function(req,res){
    server.unifiedServer(req,res);
});

server.httpsServerOptions = {
    key : fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
    cert : fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
};

// Instantiate the HTTPS server
server.httpsServer = https.createServer(server.httpsServerOptions, function(req,res){
    serverunifiedServer(req,res);
});

// define the request router
server.router = {
    'ping' : handlers.ping,
    'users' : handlers.users,
    'tokens' : handlers.tokens,
    'checks' : handlers.checks
}

// Init the server script
server.init = ()=>{

    // Start the HTTP server
    server.httpServer.listen(config.httpPort, function(){
        console.log('\x1b[32m%s\x1b[0m', 'HTTP server is listening at port : '+config.httpPort+' in '+config.envName+' environment.');
    });

    // Start the HTTPS server
    server.httpsServer.listen(config.httpsPort, function(){
        console.log('\x1b[32m%s\x1b[0m', 'HTTPS server is listening at port : '+config.httpsPort+' in '+config.envName+' environment.');
    });

};

// Export the server
module.exports = server;