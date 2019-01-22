var readline = require('readline');
var util = require('util');
var debug = util.debuglog('cli');

// setting up event class dependencies
var events = require('events');
class _events extends events{};
var e = new _events();

// Instantiate the cli 
var cli = {};

// Input handlers for all cli command
e.on('man', (str) => {
    cli.responders.help();
});

e.on('help', (str) => {
    cli.responders.help();
});

e.on('exit', (str) => {
    cli.responders.exit();
});

e.on('stats', (str) => {
    cli.responders.stats();
});

e.on('list users', (str) => {
    cli.responders.listUsers();
});

e.on('more user info', (str) => {
    cli.responders.moreUserInfo();
});

e.on('list checks', (str) => {
    cli.responders.listChecks();
});

e.on('more check info', (str) => {
    cli.responders.moreCheckInfo(str);
});

e.on('list logs', (str) => {
    cli.responders.listLogs();
});

e.on('more log info', (str) => {
    cli.responders.moreLogInfo(str);
});

// Responder object
cli.responders = {};

// help / man responder
cli.responders.help = () => {
    console.log('You asked for help.');
};

// exit responder
cli.responders.exit = () => {
    console.log('You asked for exit.');
};

// stats responder
cli.responders.stats = () => {
    console.log('You asked for stats.');
};

// responder to log users list
cli.responders.listUsers = () => {
    console.log('You asked for users list.');
};

// more user info responder
cli.responders.moreUserInfo = (str) => {
    console.log('You asked for more user info.', str);
};

// responders to log checks list
cli.responders.listChecks = (str) => {
    console.log('You asked for checks list.', str);
};

// more check info responder
cli.responders.moreCheckInfo = (str) => {
    console.log('You asked for more check info.', str);
};

// responders to log logs list
cli.responders.listLogs = () => {
    console.log('You asked for logs list.');
};

// more log info responder
cli.responders.moreLogInfo = (str) => {
    console.log('You asked for more log info.', str);
};

// input processor
cli.processInput = (str) => {
    str = typeof(str) === 'string' && str.trim().length > 0 ? str.trim() : false;
    if(str) {
        // codify the unique CLI commands
        var uniqueInputs = [
            'man',
            'help',
            'exit',
            'stats',
            'list users',
            'more user info',
            'list checks',
            'more check info',
            'list logs',
            'more log info'
        ];

        // parse the cli command and init required event based on command
        var matchFound = false;
        var counter = 0;

        uniqueInputs.some((input) => {
            if(str.toLowerCase().indexOf(input) > -1){
                matchFound = true;
                // Exit an event
                e.emit(input, str);
                return true;
            }
        });

        // If no match found, prompt 'TRY AGAIN' message
        if(!matchFound) {
            console.log('Invalid cli command, try again');
        }
    }
}; 

// init the cli script
cli.init = () => {
    console.log('\x1b[34m%s\x1b[0m', 'CLI is runnnnning.');

    // start the interface
    var _interface = readline.createInterface({
        input : process.stdin,
        output : process.stdout,
        prompt : ''      
    });

    // create an initial prompt
    _interface.prompt();

    // handle each line of input seperatly
    _interface.on('line', (str) => {
        // send to input processor
        cli.processInput(str);

        // reinitialize the prompt
        _interface.prompt();
    });

    // kill process if user stops the CLI
    _interface.on('close', () => {
        process.exit(0);
    });

};

// export the modules
module.exports = cli;