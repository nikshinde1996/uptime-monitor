const url = require('url');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const config = require('../config/config.js');
const StringDecoder = require('string_decoder').StringDecoder;
const handlers = require('./handlers');
const helpers = require('./helpers');
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

        // use public handler if request if to public directory
        chosenHandler = trimmedPath.indexOf('public/') > -1 ? handlers.public : chosenHandler;
        
        // construct data object to send to the handler
        var data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : helpers.parseJsonToObject(buffer)
        };

            // route the request to the handler specified in the router
        chosenHandler(data, (statusCode, payload, contentType) => {
            try{
                // determine the type of response (fallback to JSON)
                contentType = typeof(contentType) === 'string' ? contentType : 'json';
            
                // use the statusCode called back by the handler or use the default
                statusCode = typeof(statusCode) === 'number' ? statusCode : 200;
                
                // convert the payload to the string
                var payloadString = '';
                
                // return the response parts that are content specific
                if(contentType === 'json') {
                    res.setHeader('Content-Type','application/json');
                    payload = typeof(payload) === 'object' ? payload : {};
                    payloadString = JSON.stringify(payload);
                }
                if(contentType === 'html') {
                    res.setHeader('Content-Type','text/html');
                    payloadString = typeof(payload) === 'string' ? payload : '';
                }
                if(contentType === 'favicon') {
                    res.setHeader('Content-Type','image/x-icon');
                    payloadString = typeof(payload) !== 'undefined' ? payload : '';
                }
                if(contentType === 'css') {
                    res.setHeader('Content-Type','text/css');
                    payloadString = typeof(payload) !== 'undefined' ? payload : '';
                }
                if(contentType === 'plain') {
                    res.setHeader('Content-Type','text/pain');
                    payloadString = typeof(payload) !== 'undefined' ? payload : '';
                }
                if(contentType === 'jpg') {
                    res.setHeader('Content-Type','image/jpg');
                    payloadString = typeof(payload) !== 'undefined' ? payload : '';
                }
                if(contentType === 'png') {
                    res.setHeader('Content-Type','image/png');
                    payloadString = typeof(payload) !== 'undefined' ? payload : '';
                }
                // return the response parts that are common to all content-types
                res.writeHead(statusCode);
                res.end(payloadString);

                // { 32:green, 31:red }
                if(statusCode == 200){
                    debug('\x1b[32m%s\x1b[0m', 'Returning response : ',statusCode, payloadString);
                }else {
                    debug('\x1b[31m%s\x1b[0m', 'Returning response : ',statusCode, payloadString);
                }

            }catch(e) {
                debug(e);
            }        
        });
    });
}

// Instantiate the HTTP server
server.httpServer = http.createServer((req,res) => {
    server.unifiedServer(req,res);
});

server.httpsServerOptions = {
    key : fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
    cert : fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
};

// Instantiate the HTTPS server
server.httpsServer = https.createServer(server.httpsServerOptions, (req,res) => {
    serverunifiedServer(req,res);
});

// define the request router
server.router = {
    '' : handlers.index,
    'account/create' : handlers.accountCreate,
    'account/edit' : handlers.accountEdit,
    'account/deleted' : handlers.accountDeleted,
    'session/create' : handlers.sessionCreate,
    'session/deleted' : handlers.sessionDeleted,
    'checks/all' : handlers.checksList,
    'checks/create' : handlers.checksCreate,
    'checks/edit' : handlers.checksEdit,
    'checks/deleted' : handlers.checksDelete,
    'ping' : handlers.ping,
    'api/users' : handlers.users,
    'api/tokens' : handlers.tokens,
    'api/checks' : handlers.checks,
    'public' : handlers.public,
    'favicon.ico' : handlers.favicon,
    'examples/error' : handlers.exampleError
}

// Init the server script
server.init = ()=>{

    // Start the HTTP server
    server.httpServer.listen(config.httpPort, () => {
        console.log('\x1b[32m%s\x1b[0m', 'HTTP server is listening at port : '+config.httpPort+' in '+config.envName+' environment.');
    });

    // Start the HTTPS server
    server.httpsServer.listen(config.httpsPort, () => {
        console.log('\x1b[32m%s\x1b[0m', 'HTTPS server is listening at port : '+config.httpsPort+' in '+config.envName+' environment.');
    });

};

// Export the server
module.exports = server;