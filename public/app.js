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
app.client.request = (headers, path, method, queryStringObject, payload, callback) => {

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

app.bindForms = function() {
    if(document.querySelector("form")){
        var allForms = document.querySelectorAll("form");
        // prevent unwanted/defaut event propogation from all forms
        for(var i = 0; i < allForms.length; i++){
            allForms[i].addEventListener("submit", function (e) {

                // Stop it from submitting
                e.preventDefault();
                var formId = this.id;
                var path = this.action;
                var method = this.method.toUpperCase();

                // Hide the error message (if it's currently shown due to a previous error)
                document.querySelector("#"+formId+" .formError").style.display = 'none';

                // Hide the success message (if it's currently shown due to a previous error)
                if(document.querySelector("#"+formId+" .formSuccess")){
                    document.querySelector("#"+formId+" .formSuccess").style.display = 'none';
                }

                // Turn the inputs into a payload
                var payload = {};
                var elements = this.elements;

                for(var i = 0; i < elements.length; i++){
                    if(elements[i].type !== 'submit'){
                        // Determine class of element and set value accordingly
                        var classOfElement = typeof(elements[i].classList.value) == 'string' && elements[i].classList.value.length > 0 ? elements[i].classList.value : '';
                        var valueOfElement = elements[i].type == 'checkbox' && classOfElement.indexOf('multiselect') == -1 ? elements[i].checked : classOfElement.indexOf('intval') == -1 ? elements[i].value : parseInt(elements[i].value);
                        var elementIsChecked = elements[i].checked;

                        // Override the method of the form if the input's name is _method
                        var nameOfElement = elements[i].name;
                        if(nameOfElement == '_method'){
                            method = valueOfElement;
                        } else {
                            // Create an payload field named "method" if the elements name is actually httpmethod
                            if(nameOfElement == 'httpmethod'){
                                nameOfElement = 'method';
                            }

                            // Create an payload field named "id" if the elements name is actually uid
                            if(nameOfElement == 'uid'){
                                nameOfElement = 'id';
                            }

                            // If the element has the class "multiselect" add its value(s) as array elements
                            if(classOfElement.indexOf('multiselect') > -1){
                                if(elementIsChecked){
                                    payload[nameOfElement] = typeof(payload[nameOfElement]) == 'object' && payload[nameOfElement] instanceof Array ? payload[nameOfElement] : [];
                                    payload[nameOfElement].push(valueOfElement);
                                }
                            } else {
                                payload[nameOfElement] = valueOfElement;
                            }
                        }
                    }
                }

                // If the method is DELETE, the payload should be a queryStringObject instead
                var queryStringObject = method == 'DELETE' ? payload : {};

                // Call the API
                app.client.request(undefined,path,method,queryStringObject,payload,function(statusCode,responsePayload) {
                    // Display an error on the form if needed
                    if(statusCode === 200) {
                         // If successful, send to form response processor
                         app.formResponseProcessor(formId,payload,responsePayload);
                    } else {
                        if(statusCode == 403){
                            // log the user out
                            app.logUserOut();
                        } else {
                            // Try to get the error from the api, or set a default error message
                            var error = typeof(responsePayload.Error) == 'string' ? responsePayload.Error : 'An error has occured, please try again';

                            // Set the formError field with the error text
                            document.querySelector("#"+formId+" .formError").innerHTML = error;

                            // Show (unhide) the form error field on the form
                            document.querySelector("#"+formId+" .formError").style.display = 'block';
                        }
                    }
                });
            });
        }
    }
};

// Form response processor
app.formResponseProcessor = (formId, requestPayload, responsePayload) => {
    var functionToCall = false;
    
    // immediatly login user if account creation is successful
    if(formId == 'accountCreate'){
        console.log('Successfully created the account.');
    }
};

// init application, bind all the UI elements to respective events
app.init = () => {
    // bind form submission
    app.bindForms();



};

// call app initialization as soon as window loads
window.onload = () => {
    app.init();
};