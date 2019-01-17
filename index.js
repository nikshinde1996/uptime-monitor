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

// While startup we can use node_debug module "http"
// for getting additional debug logs on running app
// NODE_DEBUG=http node file_name.js
// additionally we can also user util and debug packages provided by node
// to provide debug messages as code, method, file level 