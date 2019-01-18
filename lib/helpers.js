const crypto = require('crypto');
const config = require('../config/config');
const querystring = require('querystring');
const https = require('https');
const path = require('path');
const fs = require('fs');

var helpers = {};

// create as SHA256 hash
helpers.hash = (str) => {
    if(typeof(str) == 'string' && str.length>0) {
        var hash = crypto
                    .createHmac('sha256', config.hashingSecret)
                    .update(str)
                    .digest('hex');
        return hash;
    }else {
        return false;
    }
};

helpers.parseJsonToObject = function(str){
    try{
        return JSON.parse(str);
    }catch(error){
        return {};
    }
};

helpers.createRandomString = (strLength) => {
    strLength = (typeof(strLength)==='number' && strLength>0) ? strLength : false;
    if(strLength){
        var possibleChars = 'abcdefghijklmonpqrstuvwxyz0123456789';
        var str = '';
        for(i=0;i<strLength;i++){
            str += possibleChars.charAt(Math.floor(Math.random()*possibleChars.length));
        }
        return str;
    }else {
        return false;
    }
};

// send SMS via twilio
helpers.sendTwilioSMS = (phone, msg, callback) => {
    // validate the parameters
    phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false; 
    msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;

    if(phone && msg){
        //  configure request payload
        var payload = {
            'From' : 'config.twilio.fromPhone',
            'To' : '+91'+phone,
            'Body' : msg
        };

        // stringigy the payload
        var stringPayload = querystring.stringify(payload);

        // configure the request details
        var requestDetails = {
            'protocol' : 'https:',
            'hostname' : 'api.twilio.com',
            'method' : 'POST',
            'path' : '/2010-04-01/Accounts/'+config.twilio.accountSid+'/Message.json',
            'auth' : config.twilio.accountSid+':'+config.twilio.authToken,
            'headers' : {
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Content-Length' : Buffer.byteLength(stringPayload)
            }
        };

        // Instantiate the request object
        var req = https.request(requestDetails, (res) => {
            var status = res.statusCode;

            if(status == 200 || status == 201){
                callback(false);
            }else {
                callback('Status code returned was ', status);
            }
        });

        // bind error event so it doesn't get thrown
        req.on('error', (error) => {
            callback(error);
        });

        // add payload
        req.write(stringPayload);

        // end the request
        req.end();
    }else {
        callback('Given parameters were invalid for missing');
    }
}

// send Email via twilio
helpers.sendTwilioEmail = (emailID, msg, callback) => {
    // validate the parameters
    phone = typeof(emailID) == 'string' ? emailID.trim() : false; 
    msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;

    if(emailID && msg){
       
    }else {
        callback('Given parameters were invalid for missing');
    }
}

// get string content of template
helpers.getTemplate = (templateName, callback) => {
    templateName = typeof(templateName) === 'string' && templateName.length > 0 ? templateName : false;
    if(templateName){
        var templateDir = path.join(__dirname, '/../templates/');
        fs.readFile(templateDir+templateName+'.html', 'utf8', (error, str) => {
            if(!error && str){
                callback(false, str);
            }else {
                callback('Error : failed to read tamplate file content');
            }
        });
    }else {
        callback('Error : specified template name is not valid.');
    }
};

// export modules
 module.exports = helpers;
