/**
 * TLS (Net) SERVER EXAMPLE
 * 
 */

const net = require('tls');
const fs = require('fs');
const path = require('path');

// server options
var options = {
    // Only ceritificte required for clients
    cert : fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
};

var outboundMessge = 'ping';

var client = net.createConnection(6000, options, () => {
    // send message
    client.write(outboundMessge)
});

client.on('data', (inboundMessage) => {
    var messageString = inboundMessage.toString();
    console.log('InboundMessage : ', messageString);
    client.end();
});