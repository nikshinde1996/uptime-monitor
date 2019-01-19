const _data = require('./data');
const helpers = require('./helpers');
const config = require('../config/config');

// define the handlers object
var handlers = {};

/**
 ***************************** HTML Handlers *****************************
 */

// index handler 
handlers.index = (data, callback) => {
    // reject any request that isn't GET
    if(data.method == 'get'){
        // prepare data for interpolation
        var templateData = {
            'head.title' : 'Uptime Montior',
            'head.description' : 'Cool website uptimes montoring tool',
            'body.title' : 'Uptime Montior',
            'body.class' : 'index'
        };

        // read the index template
        helpers.getTemplate('index',templateData, (error, str) => {
            if(!error && str) {
                helpers.addUniversalTemplates(str, templateData, (error, resString) => {
                    if(!error && resString){
                        // return complete page as HTML
                        callback(200, resString, 'html');
                    }else {
                        callback(500, undefined, 'html');
                    }
                });
            }else {
                callback(500, undefined, 'html');
            }
        });
    }else {
        callback(405, undefined, 'html');
    }
    
};


/**
 *************************** JSON API Handlers ***************************
 */

// users handler
handlers.users = (data, callback) => {
    const permitedMethods = ['post', 'get', 'put', 'delete', 'head'];
    // console.log(data);
    if(permitedMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    }else{
        callback(405);
    }
};

// container for user sub methods
handlers._users = {};

// users-post
handlers._users.post = (data, callback) => {
    var firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

    // console.log(firstName, lastName, phone, password, tosAgreement);
    if(firstName && lastName && phone && password && tosAgreement){
        // check existance of user
        _data.read('users', phone, (error, data) => {
            if(error){
                // hash the password
                var hashedPassword = helpers.hash(password);

                if(hashedPassword){
                    // create user object
                    const userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashedPassword': hashedPassword,
                        'tosAgreement': tosAgreement
                    };
                    // store the user
                    _data.create('users', phone, userObject, (error) => {
                        if(!error){
                            callback(200);
                        }else{
                            callback(500, {'Error': 'Failed to create user.'});
                        }
                    });
                }else{
                    callback(500, {'Error': 'Could not hash the user\'s password '});
                }
            }else{  
                callback(400, {'Error': 'User with entered phone number already exists'});
            }
        });
    }else {
        callback(400, {'Error': 'Missing required fields'});
    }
};

// users-get
// only let authenticated user access his data
handlers._users.get = (data, callback) => {
    // check that phone number if valid
    var phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false; 
    if(phone){
        var token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
        handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
            if(tokenIsValid) {
                _data.read('users', phone, (error, data) => {
                    if(!error && data){
                        // remove hashed password from data, before returning it back to user
                        delete data.hashedPassword;
                        callback(200, data);
                    }else {
                        callback(404);
                    }
                });
            }else {
                callback(403, {'Error': 'Missing required token in header, or token is invalid'});
            }
        });
    }else{
        callback(400, 'Error : Missing required field');
    }
};

// users-put
handlers._users.put = (data, callback) => {
    // required field for authenticate
    var phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    // optional field, need to update
    var firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    if(phone){
        if(firstName || lastName || password){
            // lookup the user
            var token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
            handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
                if(tokenIsValid){
                    _data.read('users', phone, (error, userData) => {
                        if(!error && userData){
                            // update user data
                            if(firstName){
                                userData.firstName = firstName;
                            }
                            if(lastName){
                                userData.lastName = lastName;
                            }
                            if(password){
                                userData.password = helpers.hash(password);
                            }
                            // console.log('New UserData : ',userData);
                            // update the data
                            _data.update('users', phone, userData, (error) => {
                                if(!error){
                                    callback(200);
                                }else{
                                    callback(500, 'Error : Failed to update the user data');
                                }
                            });
                        }else{
                            callback(400, 'Error : User data missing');
                        }
                    });
                }else {
                    callback(403, {'Error': 'Missing required token in header, or token is invalid'});
                }
            });    
        }else {
            callback(400, 'Error : Missing fields to update');
        }
    }else {
        callback(400, 'Error : Required field missing');
    }
};

// users-delete
handlers._users.delete = (data, callback) => {
    // check that phone number if valid
    var phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false; 
    console.log(phone);
    if(phone){
        var token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
        handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
            if(tokenIsValid){
                _data.read('users', phone, (error, data) => {
                    if(!error && data){
                        // delete the user file from .data
                        _data.delete('users', phone, (error) => {
                            if(!error){
                                callback(200);
                            }else {
                                callback(400, {'Error': 'Failed while deleting the user data'});
                            }
                        });
                    }else {
                        callback(400, {'Error': 'Could not find the specified user'});
                    }
                });
            }else {
                callback(403, {'Error': 'Missing required token in header, or token is invalid'});
            }
        }); 
    }else{
        callback(400, 'Error : Missing required field');
    }
};

// token handler
handlers.tokens = (data, callback) => {
    const permitedMethods = ['post', 'get', 'put', 'delete', 'head'];
    // console.log(data);
    if(permitedMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    }else{
        callback(405);
    }
};

// container for token handler sub methods
handlers._tokens = {};

// tokens-post
// Required data {phone and password}
handlers._tokens.post = (data, callback) => {
    var phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    if(phone && password){
        // look up for user with phone number provided
        _data.read('users', phone, (error, userData) => {
            if(!error && userData){
                var hashedPassword = helpers.hash(password);
                if(hashedPassword == userData.hashedPassword){
                    // create a token with random name
                    // set ttl of 1 hr
                    var tokenId = helpers.createRandomString(20);
                    var expires = Date.now() + 1000*6*60;
                    var tokenObject = {
                        'phone': phone,
                        'id': tokenId,
                        'expires': expires
                    };
                    // store the token
                    console.log(tokenObject);
                    _data.create('tokens', tokenId, tokenObject, (error) => {
                        if(!error){
                            callback(200, tokenObject);
                        }else{
                            callback(400, {'Error':'Could not create the new token'});
                        }
                    });


                }else{
                    callback(400, 'Password did not match with users stored password.');
                }
            }else{
                callback(404, {'Error':'Could not find the specified user'});
            }
        });
    }else{
        callback(400, {'Error': 'Missing required fields'});
    }
}

// tokens-get
handlers._tokens.get = (data, callback) => {
    var id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false; 
    if(id){
        _data.read('tokens', id, (error, tokenData) => {
            if(!error && tokenData){
                callback(200, tokenData);
            }else {
                callback(404);
            }
        });
    }else{
        callback(400, 'Error : Missing required field');
    }
}

// tokens-put
handlers._tokens.put = (data, callback) => {
    console.log(data);
    var id = typeof(data.payload.id) === 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false; 
    var extend = typeof(data.payload.extend) === 'boolean' && data.payload.extend == true ? true : false;
    if(id && extend){
        _data.read('tokens', id, (error, tokenData) => {
            if(!error && tokenData){
                if(tokenData.expires > Date.now()){
                    // update expiration
                    tokenData.expires = Date.now() + 1000*60*60;
                    _data.update('tokens', id, tokenData, (error) => {
                        if(!error){
                            callback(200);
                        }else {
                            callback(500, {'Error': 'Could not update tokens expiration'});
                        }
                    });
                }else {
                    callback(400, {'Error': 'Specified token allready expired'});
                }
            }else {
                callback(400, {'Error': 'Specified token does not exist'});
            }
        });
    }else {
        callback(400, {'Error': 'Missing required fields'});
    }
}

// tokens-delete
handlers._tokens.delete = (data, callback) => {
    var id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false; 
    if(id){
        _data.read('tokens', id, (error, tokenData) => {
            if(!error && tokenData){
                // delete the user file from .data
                _data.delete('users', id, (error) => {
                    if(!error){
                        callback(200);
                    }else {
                        callback(400, {'Error': 'Failed while deleting the user data'});
                    }
                });
            }else {
                callback(400, {'Error': 'Could not find the specified user'});
            }
        });
    }else{
        callback(400, 'Error : Missing required field');
    }
}

// verify if given token id is valid for given user
handlers._tokens.verifyToken = (id, phone, callback) => {
    _data.read('tokens', id, (error, tokenData) => {
        if(!error && tokenData){
            // check that token is for user and not-expired
            if(phone === tokenData.phone && tokenData.expires > Date.now()){
                callback(true);
            }else {
                callback(false);
            }
        }else {
            callback(false);
        }
    });
};

// checks handler
handlers.checks = (data, callback) => {
    const permitedMethods = ['post', 'get', 'put', 'delete', 'head'];
    // console.log(data);
    if(permitedMethods.indexOf(data.method) > -1) {
        handlers._checks[data.method](data, callback);
    }else{
        callback(405);
    }
};

// container for checks handler sub methods
handlers._checks = {};

// checks - post
// Required data : protocol, url, method, successCodes, timeoutSeconds
handlers._checks.post = (data, callback) => {
    var protocol = typeof(data.payload.protocol) === 'string' && ['http','https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    var url = typeof(data.payload.url) === 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    var method = typeof(data.payload.method) === 'string' && ['post','get','put','delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    var successCodes = typeof(data.payload.successCodes) === 'object' && data.payload.successCodes instanceof Array  && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    var timeoutSeconds = typeof(data.payload.timeoutSeconds) === 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

    if(protocol && url && method && successCodes && timeoutSeconds) {
        // get token from the headers
        var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

        // lookup the user by reading the token
        _data.read('tokens', token, (error, tokenData) => {
            if(!error && tokenData){
                var userPhone = tokenData.phone;

                // lookup user data
                _data.read('users', userPhone, (error, userData) => {
                    if(!error && userData){
                        var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                        
                        // verify user has checks less than max_checks specified
                        if(userChecks.length < config.maxChecks){
                            // create a random check id
                            var checkId = helpers.createRandomString(20);

                            // create check object and include phone number
                            var checkObject = {
                                'id': checkId,
                                'userPhone': userPhone,
                                'protocol': protocol,
                                'url': url,
                                'method': method,
                                'successCodes': successCodes,
                                'timeoutSeconds': timeoutSeconds
                            };

                            // save the object
                            _data.create('checks',checkId, checkObject, (error) => {
                                if(!error){
                                    // add check it to users object
                                    userData.checks = userChecks;
                                    userData.checks.push(checkId);

                                    // save the new user data
                                    _data.update('users', userPhone, userData, (error) => {
                                        if(!error){
                                            callback(200, checkObject);
                                        }else {
                                            callback(400, {'Error' : 'Could not update the data with new check'});
                                        }
                                    });
                                }else {
                                    callback(500, {'Error' : 'Could not create a new check'});
                                }
                            });
                        }else {
                            callback(400, {'Error' : 'The user allready has maximum number of checks ('+ config.maxChecks +')'});
                        }
                    }else {
                        callback(403);
                    }
                });
            }else {
                callback(403); // 403 - Not authorised
            }
        });
    }else {
        callback(400, {'Error' : 'Missing required inputs, or inputs are invalid'})
    }
}

// checks - get
handlers._checks.get = (data, callback) => {
    // check that id if valid
    var id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.phone.trim().length == 20 ? data.queryStringObject.id.trim() : false; 
    if(id){
        // looktup the check
        _data.read('checks', checkId, (error, checkData) => {
            if(!error && checkData){
                var token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
                // verify that the token is valid and belongs to the user who created the checks
                handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
                    if(tokenIsValid) {
                        // return the check data
                        callback(200, checkData);
                    }else {
                        callback(403);
                    }
                });
            }else {
                callback(404);
            }
        })
    }else{
        callback(400, 'Error : Missing required field');
    }
}

// checks - put
// required data - id
// optional data - protocol, url, method, successCodes, timeoutSeconds
handlers._checks.put = (data, callback) => {
    // required field
    var id = typeof(data.payload.id) === 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;

    // optional field, need to update
    var protocol = typeof(data.payload.protocol) === 'string' && ['http','https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    var url = typeof(data.payload.url) === 'string' && data.payload.url.trim().length > 0 ? data.payload.phone.trim() : false;
    var method = typeof(data.payload.method) === 'string' && ['post','get','put','delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    var successCodes = typeof(data.payload.successCodes) === 'object' && data.payload.successCodes instanceof Array  && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    var timeoutSeconds = typeof(data.payload.timeoutSeconds) === 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;
    
    if(id){
        if(protocol || url || method || successCodes || timeoutSeconds){
            // lookup the user
            _data.read('checks', id, (error, checkData) => {
                if(!error && checkData) {

                    var token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
                        handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
                        if(tokenIsValid){
                            _data.read('users', phone, (error, checkData) => {
                                if(!error && userData){
                                    // update user data
                                    if(protocol){
                                        checkData.protocol = protocol;
                                    }
                                    if(url){
                                        checkData.url = url;
                                    }
                                    if(method){
                                        checkData.method = method;
                                    }
                                    if(successCodes){
                                        checkData.successCodes = successCodes;
                                    }
                                    if(timeoutSeconds){
                                        checkData.timeoutSeconds = timeoutSeconds;
                                    }
                                    // console.log('New checkData : ',checkData);
                                    // update the data
                                    _data.update('checks', id, checkData, (error) => {
                                        if(!error){
                                            callback(200);
                                        }else{
                                            callback(500, 'Error : Failed to update the check data');
                                        }
                                    });
                                }else{
                                    callback(400, 'Error : User data missing');
                                }
                            });
                        }else {
                            callback(403, {'Error': 'Missing required token in header, or token is invalid'});
                        }
                    });
                }else {
                    callback(400, {'Error' : 'Check Id does not exist'});
                }
            });  
        }else {
            callback(400, 'Error : Missing fields to update');
        }
    }else {
        callback(400, 'Error : Required field missing');
    }
}

// checks - delete
// required data - id
handlers._checks.delete = (data, callback) => {
    // check that id number if valid
    var id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length == 10 ? data.queryStringObject.id.trim() : false; 
    console.log(id);
    if(id){

        // look up for the check data
        _data.read('checks', id, (error, checkData) => {
            if(!error && checkData){

                var token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
                handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
                    
                    if(tokenIsValid){
                        _data.read('users', phone, (error, userData) => {
                            if(!error && userData){
                                _data.delete('users', phone, (error) => {
                                    if(!error){
                                        var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : false;
                                        var checksToDelete = userChecks.length;
                                        if(checksToDelete > 0){
                                            var checksDeleted = 0;
                                            var deletionErrors = false;

                                            // loop through all the checks
                                            userChecks.array.forEach(checkId => {
                                                // delete checks
                                                _data.delete('checks', checkId, (error)=> {
                                                    if(error){
                                                        deletionErrors = true;
                                                    }
                                                    checksDeleted++;
                                                    if(checksDeleted == checksToDelete){
                                                        if(!deletionErrors){
                                                            callback(200)
                                                        }else {
                                                            callback(500, {'Erro' : 'Errors encountered while deleteing the checks'});
                                                        }
                                                    }
                                                });
                                            });
                                        }else {
                                            callback(200);
                                        }
                                    }else {
                                        callback(500, {'Error' : 'Could not delete the specified user'});
                                    }
                                });
                            }else {
                                callback(400, {'Error' : 'Could not find the specified user'});
                            }
                        });
                    }else {
                        callback(403, {'Error': 'Missing required token in header, or token is invalid'});
                    }
                });
            }else {
                callback(400, {'Error' : 'Specified check id does not exist'});
            }
        });
    }else{
        callback(400, 'Error : Missing required field');
    }
}

// ping handler
handlers.ping = (data, callback) => {
    callback(200);
};

// not found handler
handlers.notFound = (data, callback) => {
    callback(404);
};

module.exports = handlers;