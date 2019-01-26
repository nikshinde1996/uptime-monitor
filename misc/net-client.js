/**
 * TCP (Net) SERVER EXAMPLE
 * 
 */

const net = require('net');

var outboundMessge = 'ping';

var client = net.createConnection({'port' : 6000}, () => {
    // send message
    client.write(outboundMessge)
});

client.on('data', (inboundMessage) => {
    var messageString = inboundMessage.toString();
    console.log('InboundMessage : ', messageString);
    client.end();
});