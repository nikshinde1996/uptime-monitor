const _data = require('./data');
const helpers = require('./helpers');

// define the handlers object
var handlers = {};

// users handler
handlers.users = (data, callback) => {
    const permitedMethods = ['post', 'get', 'put', 'delete', 'head'];
    console.log(data);
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
        _data.read('users', phone, (error, data) => {
            if(!error && data){
                // remove hashed password from data, before returning it back to user
                delete data.hashedPassword;
                callback(200, data);
            }else {
                callback(404);
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
    }else{
        callback(400, 'Error : Missing required field');
    }
};

// ping handler
handlers.ping = (data, callback) => {
    callback(200);
};

// not found handler
handlers.notFound = (data, callback) => {
    callback(404);
};

module.exports = handlers;