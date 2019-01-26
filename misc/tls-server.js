/**
 * TLS (Net) SERVER EXAMPLE
 * 
 */

const net = require('tls');
const fs = require('fs');
const path = require('path');

// server options
var options = {
    key : fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
    cert : fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
};

// create a server
var server = net.createServer(options, (connection) => {
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
