/**
 * TCP (Net) SERVER EXAMPLE
 * 
 */

const net = require('net');

// create a server
var server = net.createServer((connection) => {
    // send 'PONG' on connection
    var outboundString = 'PONG';
    connection.write(outboundString);

    connection.on('data', (inboundMessage) => {
        var messageString = inboundMessage.toString();

        console.log('InboundMessage : ', messageString);
    });
});

// listen at port 2000
server.listen(2000);
