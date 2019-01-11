const _data = require('./data');
const helpers = require('./helpers');

// define the handlers object
var handlers = {};

// users handler
handlers.users = (data, callback) => {
    const permitedMethods = ['post', 'get', 'put', 'delete', 'head'];
    if(permitedMethods.findIndex(data.method) > 0) {

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
    var password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length == 10 ? data.payload.password.trim() : false;
    var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement.trim().length == true ? true : false;

    if(firstName && lastName && phone && password && tosAgreement){
        // check existance of user
        _data.read('users', phone, (error, data) => {
            if(error){
                // hash the password
                var hashedPassword = helpers.hash(password);

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
                callback(400, 'User with entered phone number already exists');
            }
        });
    }else {
        callback(400, {'Error': 'Missing required fields'});
    }
};

// users-get
handlers._users.get = (data, callback) => {

};

// users-put
handlers._users.put = (data, callback) => {

};

// users-delete
handlers._users.delete = (data, callback) => {

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