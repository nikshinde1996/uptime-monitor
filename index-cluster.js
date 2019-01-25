const server = require('./lib/server');
const worker = require('./lib/worker');
const cli = require('./lib/cli');
const cluster = require('cluster');
const os = require('os');

// Declare the app
var app = {};

// init the function
app.init = (callback) => {
   
    // start the worker on the single cluster, no need to add additional CPU's for them
    // instead for servers, use node clusters, so as to divide the load accross CPU's
    
    if(cluster.isMaster){
        // start the worker
        worker.init();

        // start CLI at the end
        setTimeout(() => {
            cli.init();
            callback();
        }, 50);

        // FORK the master process to start the child thread's to run on server
        // n forks for n CPU's
        for(var i=0;i<os.cpus();i++){
            cluster.fork();
        }

    }else {
        // start the server, if we'r not on the master thread
        server.init();
    }
    
    // This method od using clusters is awesome for distributing the load on multiple servers but,
    // it might become little tricky for the tesing part. 
};

// Execute the app {SELF EXECUTE DIRECTLY ONLY IF REQUIRED}
if(require.main === module){
    app.init(() => {});
}

// Export the app
module.exports = app;

// While startup we can use node_debug module "http"
// for getting additional debug logs on running app
// NODE_DEBUG=http node file_name.js
// additionally we can also user util and debug packages provided by node
// to provide debug messages as code, method, file level 