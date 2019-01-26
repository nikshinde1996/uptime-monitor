/**
 *  EXAMPLE RELP Server
 */

var repl = require('repl');

// start the repl the server
repl.start({
    'prompt' : '>>>',
    'eval' : (str) => {
        console.log('Evaluating [ '+str+' ]');

        // if user 'ping', reply 'PONG'
        if(str.indexOf('ping') > -1){
            console.log('\x1b[31m%s\x1b[0m', 'PONG');
        }
    }
});