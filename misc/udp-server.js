/**
 * UDP SERVER EXAMPLE
 * 
 * Creating a datagram server on 2000
 */

const dgram = require('dgram');

// create a server
const server = dgram.createSocket('udp4');

server.on('message', (messageBuffer, sender) => {
    // process sender and message buffer
    var messageString = messageBuffer.toString();
    console.log(messageString);
});


server.bind(2000);

