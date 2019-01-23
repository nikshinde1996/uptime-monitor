var readline = require('readline');
var util = require('util');
var debug = util.debuglog('cli');
var os = require('os');
var v8 = require('v8');
var _data = require('./data');
var _log = require('./log');
var _helpers = require('./helpers');

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

// end with horizontal line
cli.horizontalLine = () => {
    var width = process.stdout.columns; // current screen size
    var line = '';
    for(var i=0;i<width;i++){
        line+='-';
    }
    console.log(line);
};

// add n vertical spaces
cli.verticalSpace = (n) => {
    n = typeof(n) == 'number' && n > 0 ? n : 1;
    for(var i=0;i<n;i++) {
        console.log('\n');
    }
};

cli.centered = (str) => {
    var width = process.stdout.columns; // current screen size

    var leftPadding = Math.floor((width - str.length)/2);
    var strLine = '';
    for(var i=0;i<leftPadding;i++){
        strLine+=' ';
    }
    strLine+=str;
    console.log(strLine);
};

// help / man responder
cli.responders.help = () => {
    var commands = {
        'man' : 'Show this manual help page.',
        'help' : 'Alias of "man" command.',
        'exit' : 'Kill CLI, and stop the application.',
        'stats' : 'Get statistics of OS and resouce utilisation.',
        'list users' : 'Show list of all registered/undeleted users in the system.',
        'more user info --{userId}' : 'Show details of specific user',
        'list checks --up --down' : 'Show the list of active checks in the system, including their state --{up/down}',
        'more check info --{checkId}' : 'Show detailds of specific check',
        'list logs' : 'Show a list of log files available to read (compressed and uncompressed)',
        'more log info --{logId}' : 'Show details of specifc log'
    };

    // Create terminal formatting to display manual data
    cli.horizontalLine();
    cli.centered('CLI MANUAL');
    cli.horizontalLine();
    cli.verticalSpace(2);

    // Show each command followed by description
    for(var key in commands){
        if(commands.hasOwnProperty(key)){
            var value = commands[key];
            var line = '\x1b[33m'+key+'\x1b[0m';
            var padding = 60 - line.length;
            for(var i=0;i<padding;i++){
                line+=' ';
            }
            line+= value;
            console.log(line);
            cli.verticalSpace();
        }
    }
    cli.horizontalLine();
};

// exit responder
cli.responders.exit = () => {
    process.exit(0);
};

// stats responder
cli.responders.stats = () => {
    var statsKeys = {
        'Load Average' : os.loadavg().join(' '),
        'CPU Count' : os.cpus().length,
        'Free Memeory' : os.freemem(),
        'Current Malloced Memory' : v8.getHeapStatistics().malloced_memory,
        'Peak Malloced Memory' : v8.getHeapStatistics().peak_malloced_memory,
        'Allocated Heap used (%)' : Math.floor(v8.getHeapStatistics().used_heap_size/v8.getHeapStatistics().total_heap_size*100),
        'Available Heap Allocated (%s)' : Math.floor(v8.getHeapStatistics().total_heap_size/v8.getHeapStatistics().heap_size_limit*100),
        'Uptime' : os.uptime()+' seconds',
    }

    // Create terminal formatting to display manual data
    cli.horizontalLine();
    cli.centered('SYSTEM STATS');
    cli.horizontalLine();
    cli.verticalSpace(2);

    // Log out stats data
    // Show each command followed by description
    for(var key in statsKeys){
        if(statsKeys.hasOwnProperty(key)){
            var value = statsKeys[key];
            var line = '\x1b[33m'+key+'\x1b[0m';
            var padding = 60 - line.length;
            for(var i=0;i<padding;i++){
                line+=' ';
            }
            line+= value;
            console.log(line);
            cli.verticalSpace();
        }
    }
    cli.horizontalLine();
};

// responder to log users list
cli.responders.listUsers = () => {
    _data.list('users',(error, userIds) => {
        if(!error && userIds && userIds.length > 0) {
            cli.verticalSpace(1);
            userIds.forEach(userId => {
                // print data for each user id
                _data.read('users', userId, (error, userData) => {
                    if(!error && userData){
                        var line =  'Name : '+userData.firstname+' '+lastName
                                   +' Phone : '+userData.phone + ' Checks : ';
                        var numberOfChecks = typeof(userData.checks) === 'object' && userData.checks instanceof Array && userData.checks.length > 0 ? userData.checks :0;
                        line += numberOfChecks;
                        console.log(line);
                        cli.verticalSpace(1);
                    }
                });
            });
        }
    });
};

// more user info responder
cli.responders.moreUserInfo = (str) => {
    // get Id from string
    var strArray = str.split('--');
    var userId = typeof(strArray[1]) == 'string' && strArray[1].trim().length > 0 ? strArray[1] : false;

    if(userId){
        // print data for input user
        _data.read('users', userId, (error, userData) => {
            if(!error && userData){
                delete userData.hashedPassword;

                // print JSON data
                cli.verticalSpace(1);
                console.dir(userData, {'color' : true});
                cli.verticalSpace(1);
            }
        });
    }
};

// responders to log checks list
cli.responders.listChecks = (str) => {
    _data.list('checks',(error, checkIds) => {
        if(!error && checkIds && checkIds.length > 0) {
            cli.verticalSpace(1);
            checkIds.forEach(checkId => {
                // print data for each user id
                _data.read('checks', checkId, (error, checkData) => {
                    if(!error && checkData){
                        var includeCheck = false;
                        var lstr = str.toLowerCase();

                        // get required check data
                        var state = typeof(checkData.state) === 'object' ? checkData.state : 'down';
                        var stateOrUnknown = typeof(checkData.state) === 'object' ? checkData.state : 'down';
                        if(lstr.indexOf('--'+state) > -1 || (lstr.indexOf('--up') == -1 && lstr.indexOf('--down') == -1 )){
                            var line = 'ID : '+checkData.id +
                                       'METHOD : '+checkData.method.toUpperCase()+
                                       'URL : '+checkData.protocol+'://'+checkData.url+
                                       'STATE : '+checkData.stateOrUnknown;
                            console.log(line);
                            cli.verticalSpace(1);
                        }
                    }
                });
            });
        }
    });
};

// more check info responder
cli.responders.moreCheckInfo = (str) => {
    // get Id from string
    var strArray = str.split('--');
    var checkId = typeof(strArray[1]) == 'string' && strArray[1].trim().length > 0 ? strArray[1] : false;

    if(checkId){
        // print data for input check
        _data.read('checks', checkId, (error, checkData) => {
            if(!error && checkData){
                // print JSON data
                cli.verticalSpace(1);
                console.dir(checkData, {'color' : true});
                cli.verticalSpace(1);
            }
        });
    }
};

// responders to log logs list
cli.responders.listLogs = () => {
    _log.list(true, (error, logFileNames) => {
        if(!error && logFileNames && logFileNames.length > 0){
            cli.verticalSpace(1);
            logFileNames.forEach(filename => {
                if(filename.indexOf('-') > -1){
                    console.log(filename);
                    cli.verticalSpace(1);
                }
            });
        }
    });
};

// more log info responder
cli.responders.moreLogInfo = (str) => {
    // get logFileName from string
    var logFileNameArr = str.split('--');
    var logFileName = typeof(logFileNameArr[1]) == 'string' && logFileNameArr[1].trim().length > 0 ? logFileNameArr[1] : false;

    if(logFileName){
        // print data from the log file
        _log.decompress(logFileName, (error, strData) => {
            if(!error && strData){
                // split data on lines
                var strArr = strData.split('\n');
                strArr.forEach(jsonString => {
                    var logObject = _helpers.parseJsonToObject(jsonString);
                    if(logObject && JSON.stringify(logObject) !== '{}'){
                        console.dir(logObject, {'colors' : true});
                        cli.verticalSpace(1);
                    }
                });
            }
        });
    }
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