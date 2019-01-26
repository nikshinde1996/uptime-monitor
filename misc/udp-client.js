/**
 * UDP CLIENT EXAMPLE
 */

const dgram = require('dgram');

// create a client
const client = dgram.createSocket('udp4');

// declare message and sender info
var messageString = 'Hello World';
var messageBuffer = Buffer.from(messageString);

// send off the message
client.send(messageBuffer, 2000, 'localhost', (error) => {
    client.close();
})