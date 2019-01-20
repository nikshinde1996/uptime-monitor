/**
 *  JS Contoller for frontend logic for uptime
 */

// container for frontend application 
var app = {};

// config
app.config = {
    'sessionToken' : false
};

// AJAX client for RESTful API
app.client = {};

// Interface for making API calls
app.client = (headers, path, method, queryStringObject, payload, callback) => {

    // set defaults
    headers = typeof(headers) == 'object' && headers != null ? headers : {};
    path = typeof(path) == 'string' ? path : '/';
    method = typeof(method) == 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(method) > -1 ? method.toLocaleUpperCase() : 'GET'; 
    queryStringObject = typeof(queryStringObject) == 'object' && queryStringObject != null ? queryStringObject : {};
    payload = typeof(payload) == 'object' && payload != null ? payload : {};
    callback = typeof(callback) == 'function' ? callback : false;

    // add query string parameters to the path
    var requestUrl = path + '?'
    var counter = 0;

    for(var key in queryStringObject){
        if(queryStringObject.hasOwnProperty(key)){
            counter++;
            if(counter > 1){
                requestUrl += '&';
            }
            // add key=value in query string
            requestUrl += key +'='+ queryStringObject[key];
        }
    }

    // Form the http request of JSON type
    var xhr = new XMLHttpRequest();
    xhr.open(method, requestUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    // add each header as key-value pair in request
    for(var headerKey in headers){
        if(headers.hasOwnProperty(headerKey)){
            xhr.setRequestHeader(headerKey, headers[headerKey]);
        }
    }

    // If session token is set, add it to header
    if(app.config.sessionToken){
        xhr.setRequestHeader('token', app.config.sessionToken.id);
    }

    // handle response
    xhr.onreadystatechange = () => {
        if(xhr.readyState = XMLHttpRequest.DONE){
            var statusCode = xhr.status;
            var responseReturned = xhr.responseText;

            // callback if requested
            if(callback){
                try{
                    var parsedResponse = JSON.parse(responseReturned);
                    callback(statusCode, parsedResponse);
                }catch(error){
                    callback(statusCode, false);
                }
            }
        }
    };

    // send payload as JSON string
    var payloadString = JSON.stringify(payload);
    xhr.send(payloadString);

};