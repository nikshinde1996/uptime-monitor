const crypto = require('crypto');
const config = require('../config/config');

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

// export modules
 module.exports = helpers;
