const server = require('./server/server');
const worker = require('./server/worker');

// Declare the app
var app = {};

// init the function
app.init = () => {
    // start the server
    server.init();

    // start the worker
    worker.init();
};

// Execute the app
app.init();

// Export the app
module.exports = app;