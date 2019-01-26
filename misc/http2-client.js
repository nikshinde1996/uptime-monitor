/**
 * EXAMPLE HTTP2 CLIENT
 * 
 */

const http2 = require('http2');

// Create a client
var client = http2.connect('http://localhost:2000');

// Create a request
var req = client.request({
    ':path' : '/'
});

// for received data, add chunks together till end
var str = '';
req.on('data', (chunk) => {
    str += chunk;
});

req.on('end', (chunk) => {
    console.log(str);
});

req.end();