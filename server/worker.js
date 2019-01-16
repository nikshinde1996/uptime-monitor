const url = require('url');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const _data = require('../lib/data.js');
const helpers = require('../lib/helpers')

// Instantiate the worker object
var worker = {};

// timer to execute the worker process once per minute
worker.loop = () => {
    setInterval(() => {
        worker.gatherAllChecks();
    }, 1000 * 60);
};

// lookup the check data and send to validate function
worker.gatherAllChecks = () => {
    // get all the checks 
    _data.list('checks', (error, checks) => {
        if(!error && checks && checks.length > 0){
            checks.forEach(check => {
                // read in the check data
                _data.read('checks', check, (error, checkData) => {
                    if(!error && checkData) {
                        // validate the check data
                        worker.validateCheckData(checkData);
                    }else {
                        console.log("Error : failed to read check data");
                    }
                });
            });
        }else {
            console.log('Error : failed to find any checks to process');
        }
    });
};

// sanity check/ validation for the check data
worker.validateCheckData = (checkData) => {
    checkData = typeof(checkData) == 'object' && checkData !== null ? checkData : {};
    checkData.id = typeof(checkData.id) == 'string' && checkData.id.trim().length == 20 ? checkData.id.trim() : false;
    checkData.userPhone = typeof(checkData.userPhone) == 'string' && checkData.userPhone.trim().length == 10 ? checkData.userPhone.trim() : false;
    checkData.protocol = typeof(checkData.protocol) == 'string' && ['http','https'].indexOf(checkData.protocol) > -1 ? checkData.protocol : false;
    checkData.url = typeof(checkData.url) == 'string' && checkData.url.trim().length > 0 ? checkData.url.trim() : false;
    checkData.method = typeof(checkData.method) == 'string' && ['post','get','put','delete'].indexOf(checkData.method) > -1 ? checkData.method : false;
    checkData.successCodes = typeof(checkData.successCodes) == 'object' && checkData.successCodes instanceof Array && checkData.successCodes.length > 0? checkData.successCodes : false;
    checkData.timeoutSeconds = typeof(checkData.timeoutSeconds) === 'number' && checkData.timeoutSeconds % 1 === 0 && checkData.timeoutSeconds >= 1 && checkData.timeoutSeconds <= 5 ? checkData.timeoutSeconds : false;

    // may not be set : for first time checked data
    checkData.state = typeof(checkData.state) == 'string' && ['up','down'].indexOf(checkData.state) > -1 ? checkData.state : 'down' ;
    
    checkData.lastChecked = typeof(checkData.lastChecked) == 'number' && checkData.lastChecked > 0 ? checkData.lastChecked : false ;

    // if all the checks passed then pass the checks to the next step of the process
    if( checkData.id && checkData.userPhone && checkData.protocol && checkData.url &&
        checkData.method && checkData.successCodes && checkData.timeoutSeconds ){
            // perform check on check data of valid
            worker.performCheck(checkData);
    }else {
        console.log('Error : check data isn\'t properly formatted. Skipping check validation');
    }
};

// perform the check 
worker.performCheck = (checkData) => {
    // prepare initial check outcome
    var checkOutcome = {
        'error' : false,
        'responseCode' : false
    };

    var outcomeSent = false;

    // parse the hostname and path out the original check data
    var parseUrl = url.parse(checkData.protocol+'://'+checkData.url, true);
    var hostname = parseUrl.hostname;
    var path = parseUrl.path;

    // construct the url
    var requestDetails = {
        'protocol' : checkData.protocol+':',
        'hostname' : hostname,
        'method' : checkData.method.toUpperCase(),
        'path' : path,
        'timeout' : checkData.timeoutSeconds * 1000
    };

    // Instantiate the request object
    var _moduleToUse = checkData.protocol == 'http' ? http : https;

    var req = _moduleToUse.request(requestDetails, (res) => {
        var status = res.statusCode;

        // update checkout 
        checkOutcome.responseCode = status;

        if(!outcomeSent) {
            worker.performCheckOutcome(checkData, checkOutcome);
            outcomeSent = true;
        }
    });

    // bind to the error
    req.on('error', (error) => {
        // update checkOutcome and pass data along
        checkOutcome.error = {
            'error' : true,
            'value' : error
        };

        if(!outcomeSent) {
            worker.performCheckOutcome(checkData, checkOutcome);
            outcomeSent = true;
        }
    });

    // bind to the timeout event
    req.on('timeout', (error) => {
        // update checkOutcome and pass data along
        checkOutcome.error = {
            'error' : true,
            'value' : 'timeout'
        };

        if(!outcomeSent) {
            worker.performCheckOutcome(checkData, checkOutcome);
            outcomeSent = true;
        }
    });

    // end the request
    req.end();
};

// process check data, update check data as needed, trigger an alert if required
// special logic for handling the check that has been never checked before
worker.performCheckOutcome = (checkData, checkOutcome) => {
    var state = !checkOutcome.error && checkOutcome.responseCode && checkData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down';

    // decide if alert is required
    var alertRequired = checkData.lastChecked && checkData.state !== state ? true : false;

    // update the check data
    var newCheckData = checkData;
    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    // save the updates 
    _data.update('checks', newCheckData.id, newCheckData, (error) => {
        if(!error) {
            // send alert if required
            if(alertRequired){
                worker.alertUserForStatusChange(newCheckData);
            }else {
                console.log('Check outcome not changed, alert not required');
            }
        }else {
            console.log('Error : failed while saving the check updates');
        }
    });
};

// send sms later using the twilio api configured
worker.alertUserForStatusChange = (newCheckData) => {
    var msg = 'Alert : Your check for '+newCheckData.method.toUpperCase()
    +' '+newCheckData.protocol+'://'+newCheckData.url+' is currently '+newCheckData.state;

    helpers.sendTwilioSMS(newCheckData.userPhone, msg, (error) => {
        if(!error){
            console.log('Success : user was alerted for status change');
        }else {
            console.log('Error : failed to send SMS alert who has state change');
        }
    }); 
};

// Init the workker script
worker.init = () => {
    // Execute all the checks immediatly
    worker.gatherAllChecks();

    // call the loop se checks will execute later 
    worker.loop();
};

// Export the worker api
module.exports = worker;
