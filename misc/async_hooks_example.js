/**
 *  EXAMPLE for async_hooks
 *  Async_hooks lets us track performance of the async modules
 *  Interesting module can automatically tract/set the marks to 
 *  mesaure the performance, very unlike the performance_hooks
 */

const async_hooks = require('async_hooks');
const fs = require('fs');

// Target execution context
var targetExecutionContext = false;

var whatTimeIsIt = (callback) => {
    setInterval(() => {
        fs.writeSync(1, 'Whehn set interval runs, th eexecution context is : '+async_hooks.executionAsyncId()+'\n');
        callback(Date.now());
    }, 5000);
};

// Call the function
whatTimeIsIt((time) => {
    fs.writeSync(1, 'Time : '+time+'\n');
});

// Hooks
var hooks = {
    init(asyncId, type, triggerAsyncId, resource) {
        fs.writeSync(1, 'Hook init : '+asyncId+'\n');
    },
    before(asyncId) {
        fs.writeSync(1, 'Hook before : '+asyncId+'\n');
    },
    after(asyncId) {
        fs.writeSync(1, 'Hook after : '+asyncId+'\n');
    },
    destroy(asyncId) {
        fs.writeSync(1, 'Hook destroy : '+asyncId+'\n');
    },
    promiseResolve(asyncId) {
        fs.writeSync(1, 'Hooks promiseResolve : '+asyncId+'\n');
    },
};

// Creat a new async hook instance
var asyncHook = async_hooks.createHook(hooks);
asyncHook.enable();