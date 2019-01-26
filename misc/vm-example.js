/**
 * RUN JS FILE IN VM
 */

const vm = require('vm');

// Define context/script to run in VM
var context = {
    'foo' : 10,
    'bar' : 20
};

// Define the script to run
var script = new vm.Script(`
    foo = foo * bar;
    foo = foo + bar;
    bar = foo / bar;
`);

// Run the script
script.runInNewContext(context);
console.log(context);

