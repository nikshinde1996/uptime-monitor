/**
 * EXAMPLE HTTP2 SERVER
 * 
 */

const http2 = require('http2');

// Initialise the server
var server = http2.createServer();

// on stream, send some html
server.on('stream', (stream, headers) => {
    stream.respond({
        'status' : 200,
        'Content-Type' : 'text/html' 
    });

    stream.end('<html><body><p>Hello World</p></body></html>')
});

// Listen on server 2000
server.listen(2000);