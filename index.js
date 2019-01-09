
const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config/config.js');
const {unifiedServer} = require('./server/server');

// Instantiate the HTTP server
const httpServer = http.createServer(function(req,res){
    unifiedServer(req,res);
});

// Start the HTTP server
httpServer.listen(config.httpPort, function(){
    console.log('Server is listening at port : '+config.httpPort+' in '+config.envName+' environment.');
});

const httpsServerOptions = {
    key : fs.readFileSync('./https/key.pem'),
    cert : fs.readFileSync('./https/cert.pem')
};

// Instantiate the HTTPS server
const httpsServer = https.createServer(httpsServerOptions, function(req,res){
    unifiedServer(req,res);
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort, function(){
    console.log('Server is listening at port : '+config.httpsPort+' in '+config.envName+' environment.');
});

// define the handlers object
var handlers = {};

// ping handler
handlers.ping = (data, callback) => {
    callback(200);
}

// not found handler
handlers.notFound = (data, callback) => {
    callback(404);
}

// define the request router
var router = {
    'ping' : handlers.ping
}

