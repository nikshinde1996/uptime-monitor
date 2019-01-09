
const http = require('http');
const http = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config/config.js');
const {unifiedServer} = require('./server/server');

// Instantiate the HTTP server
const server = http.createServer(function(req,res){
    unifiedServer(req,res);
});

// Start the HTTP server
server.listen(config.httpPort, function(){
    console.log('Server is listening at port : '+config.httpPort+' in '+config.envName+' environment.');
});

// Instantiate the HTTPS server
const server = https.createServer(function(req,res){
    unifiedServer(req,res);
});

// Start the HTTPS server
server.listen(config.httpsPort, function(){
    console.log('Server is listening at port : '+config.httpsPort+' in '+config.envName+' environment.');
});

// define the handlers object
var handlers = {
    sample : (data,callback) => {
        // sample handler : callback HTTP status code and payload
        callback(406, {'name' : 'sample handler'});
    },
    notFound : () => {
        // not found handler
        callback(404);
    }
};

// define the request router
var router = {
    'sample' : handlers.sample
}

