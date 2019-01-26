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

// bind the logout button and events
app.bindLogoutButton = () => {
    document.getElementById("logoutButton").addEventListener('click', (event) => {
        // stop from self redirecting
        event.preventDefault();

        // logout the currect user
        app.logUserOut();
    });
} 

// logout the current user anr remove all set-css/html attributes
// later redirect user to the message page
app.logUserOut = (redirectUser) => {
    redirectUser = typeof(redirectUser) == 'boolean' ? redirectUser : false;

    // get current token id
    var tokenId = typeof(app.config.sessionToken.id) == 'string' ? app.config.sessionToken.id : false ;
    
    var queryStringObject = {
        'id' : tokenId
    };

    // send above token id to app.request method to delete current token
    app.client.request = (undefined,'api/tokens','DELETE',queryStringObject,undefined, (statusCode,responsePayload) => {
        // reset sessionToken to false;
        app.setSessionToken(false);

        if(redirectUser){
            window.location = '/session/deleted';
        }
    });
}

// bind the forms and related events
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
        var newPayload = {
            'phone' : requestPayload.phone,
            'password' : requestPayload.password
        };

        app.client.request(undefined, 'api/tokens', 'POST', undefined, newPayload, (newStatusCode, newResponsePayload) => {
            if(newStatusCode === 200){
                // if successfull, set the token and redirect to inner user page
                app.setSessionToken(newResponsePayload);
                window.location = '/checks/all'
            }else {
                // Set the formError field with the error text
                document.querySelector("#"+formId+" .formError").innerHTML = 'Sorry, an error has occured. Please try again.';

                // Show (unhide) the form error field on the form
                document.querySelector("#"+formId+" .formError").style.display = 'block';
            }
        });

        // on successful login, set token in local-storage and redirect user
        if(formId == 'sessionCreate'){
            app.setSessionToken(newResponsePayload);
            window.location = '/checks/all';
        }

        // If forms saved successfully and they have success messages, show them
        var formsWithSuccessMessages = ['accountEdit1', 'accountEdit2','checksEdit1'];
        if(formsWithSuccessMessages.indexOf(formId) > -1){
            document.querySelector("#"+formId+" .formSuccess").style.display = 'block';
        }

        // if user delete their account, redirect them to account-delete page
        if(formId == 'accountEdit3') {
            app.logUserOut(false);
            window.location = '/account/deleted';
        }

        // if user create new check, redirect him back to dash board
        if(formId == 'checksCreate') {
            window.location = 'checks/all';
        }

        // if user delete the check, redirect him to the dash board
        if(formId == 'checksEdit2') {
            window.location = 'checks/all';
        }
    }
};

// set the session token in localStorage provided by node for browser
app.setSessionToken = (token) => {
    app.config.sessionToken = token;
    var tokenString = JSON.parse(token);
    // localstorage is storage space given by node in browser
    // its takes key-value pair as parameters, can retrieve value using key
    localStorage.setItem('token', tokenString);

    // set the logged in status for user and redirect user based on result
    if(typeof(token) == 'object'){
        app.setLoggedInClass(true);
    }else {
        app.setLoggedInClass(false);
    }
};

// get session token from local storage
app.getSessionToken = () => {
    var tokenString = localStorage.getItem('token');
    if(typeof(tokenString) == 'string'){
        try {
            var token = JSON.parse(tokenString);
            app.config.sessionToken = token;
            if(typeof(token) == 'object'){
                app.setLoggedInClass(true);
            }else {
                app.setLoggedInClass(false);
            }
        }catch (e) {
            console.log('JSON parse error : ',e);
        }
    }else {
        app.config.sessionToken = false;
        app.setLoggedInClass(false)    
    }
};

// load data on page
app.loadDataOnPage = () => {
    var bodyClass = document.querySelector('body').classList;
    var mainBodyClass = typeof(bodyClass[0]) == 'string' ? bodyClass[0] : false;

    // based on main body class, set the content on current page
    if(mainBodyClass == 'accountEdit'){
        app.loadAccountEditPage();
    }

    if(mainBodyClass == 'checksEdit'){
        app.loadChecksEditPage();
    }

    if(mainBodyClass == 'checksList'){
        app.loadChecksListPage();
    }
};

// load account edit page
app.loadAccountEditPage = () => {
    var phone = typeof(app.config.sessionToken.phone) == "string" && app.config.sessionToken.phone.length == 10 ?  app.config.sessionToken.phone : false;
    if(phone) {
        // fetch user data
        var queryStringObject = {
            'phone' : phone
        };

        // fetch details
        app.client.request = (undefined,'api/users','GET',queryStringObject,undefined,(statusCode,responsePayload)=> {
            if(statusCode == 200){
                // fill old data
                document.querySelector("#accountEdit1 .firstNameInput").value = responsePayload.firstName;
                document.querySelector("#accountEdit1 .lastNameInput").value = responsePayload.lastName;
                document.querySelector("#accountEdit1 .displayPhoneInput").value = responsePayload.phone;

                // update hidden phone values
                var hiddenPhoneNumbers = document.querySelectorAll("input.hiddenPhoneNumberInput");
                for(var i=0;i<hiddenPhoneNumbers.length;i++){
                    hiddenPhoneNumbers[i].value = responsePayload.phone;
                }
            }else {
                // logout user
                app.logUserOut();
            }
        });
    }else {
        // log user out for incorrect session details
        app.logUserOut();
    }
};

// load checks list page
app.loadChecksListPage = () => {
    var phone = typeof(app.config.sessionToken.phone) == 'string' ? app.config.sessionToken.phone : false;
    if(phone) {
        // fetch user data
        var queryStringObject = {
            'phone' : phone
        };

        // fetch user data
        app.client.request = (undefined,'api/users','GET',queryStringObject,undefined,(statusCode,responsePayload) => {
            if(statusCode == 200) {
                //  get all checks for user
                var allChecks = typeof(responsePayload.checks) == 'object' && responsePayload.checks instanceof Array && responsePayload.checks.length > 0 ? responsePayload.checks : [];
                if(allChecks.length > 0){

                    // show all the checks in the different rows
                    allChecks.forEach(checkId => {
                        var queryStringObject = {
                            'id' : checkId
                        };

                        // fetch check details
                        app.client.request = (undefined,'api/checks','GET',newQueryStringObject,undefined,(statusCode,responsePayload) => {
                            if(statusCode == 200) {
                                // update all detals in single row
                                var table = document.getElementById('checksListTable');
                                var tr = table.insertRow(-1);
                                tr.classList.add("checkRow");
                                var td0 = tr.insertCell(0);
                                var td1 = tr.insertCell(1);
                                var td2 = tr.insertCell(2);
                                var td3 = tr.insertCell(3);
                                var td4 = tr.insertCell(4);
                                td0.innerHTML = responsePayload.method.toUpperCase();
                                td1.innerHTML = responsePayload.protocol+'://';
                                td2.innerHTML = responsePayload.url;
                                var state = typeof(responsePayload.state) == 'string' ? responsePayload.state : 'unknown';
                                td3.innerHTML = state;
                                td4.innerHTML = '<a href="/checks/edit?id='+responsePayload.id+'">View / Edit / Delete</a>';
                            }else {
                                console.log('\x1b[31m%s\x1b[0m','Error while loading check details');
                            }
                        });

                        if(allChecks.length < 5){
                            // Show the createCheck CTA.... for dynamizally adding block
                            document.getElementById("createCheckCTA").style.display = 'block';
                        }
                    });
                }else {
                    // set no checks messages on the loaded page
                    document.getElementById("noChecksMessage").style.display = 'table-row';

                    // Show the createCheck CTA
                    document.getElementById("createCheckCTA").style.display = 'block';
                }
            }else {
                // log user out
                app.logUserOut();
            }
        })
    }else {
        // log user out
        app.logUserOut();
    }
};

// load checks edit page
app.loadChecksEditPage = () => {
    // get checkId from url - query string, if none found redirect to dash board
    var checkId = typeof(window.location.href.split('=')[1]) == 'string' && window.location.href.split('=')[1].length > 0 ? window.location.href.split('=')[1] : false;
    if(checkId) {
        var queryStringObject = {
            'id' : checkId 
        };

        // fetch all check data beloning to check Id
        app.client.request = (undefined,'api/checks','GET',queryStringObject,undefined,(statusCode,responsePayload) => {
            if(statusCode == 200) {

                // update checks data into visible and hidden fields
                var hiddenIdInputs = document.querySelectorAll("input.hiddenIdInput");
                for(var i = 0; i < hiddenIdInputs.length; i++){
                    hiddenIdInputs[i].value = responsePayload.id;
                }

                document.querySelector("#checksEdit1 .displayIdInput").value = responsePayload.id;
                document.querySelector("#checksEdit1 .displayStateInput").value = responsePayload.state;
                document.querySelector("#checksEdit1 .protocolInput").value = responsePayload.protocol;
                document.querySelector("#checksEdit1 .urlInput").value = responsePayload.url;
                document.querySelector("#checksEdit1 .methodInput").value = responsePayload.method;
                document.querySelector("#checksEdit1 .timeoutInput").value = responsePayload.timeoutSeconds;
                var successCodeCheckboxes = document.querySelectorAll("#checksEdit1 input.successCodesInput");
                for(var i = 0; i < successCodeCheckboxes.length; i++){
                    if(responsePayload.successCodes.indexOf(parseInt(successCodeCheckboxes[i].value)) > -1){
                        successCodeCheckboxes[i].checked = true;
                    }
                }
            }else {
                // redirect to dash borad page
                window.location = '/checks/all';
            }
        });
    }else {
        // redirect to dash board page
        window.location = '/checks/all';
    }
};


// renew token every minute
app.tokenRenewalLoop = () => {
    setInterval(()=> {
        app.renewToken = (error) => {
            if(!error) {
                console.log('Token renewed successfully : '+ Date.now());
            }
        };
    }, 1000 * 60 );
};

// set/remove logged in class from html body
app.setLoggedInClass = (add) => {
    var body = document.querySelector("body");
    if(add) {
        body.classList.add('loggedIn');
    }else {
        body.classList.remove('loggedIn');
    }
};

// renew token
app.renewToken = (callback) => {
    var currentToken = typeof(app.config.sessionToken) == 'object' ? app.config.sessionToken : false;
    if(currentToken) {
        // update/extend token with new id
        var payload = {
            'id' : currentToken.id,
            'extend' : true
        };

        // set app request to /api/tokens for setting the new token
        app.client.request = (undefined,'api/tokens','PUT',undefined,payload,(statusCode,responsePayload) => {
            if(statusCode == 200){
                // new token has been extended, get token details and update in current session
                var queryStringObject = {'id' : currentToken.id};
                app.client.request = (undefined,'api/tokens','GET',queryStringObject,undefined,(statusCode,responsePayload) => {
                    if(statusCode == 200){
                        app.setSessionToken(responsePayload);
                        callback(false);
                    }else {
                        // display error on UI if needed
                        app.setSessionToken(false);
                        callback(true);
                    }
                });
            }else {
                // display error on UI if needed
                app.setSessionToken(false);
                callback(true);
            }
        });
    }else {
        // session token is not set
        app.setSessionToken(false);
        callback(true);
    }
};


// init application, bind all the UI elements to respective events
app.init = () => {
    // bind form submission
    app.bindForms();

    // Bind logout logout button
    app.bindLogoutButton();

    // get session token from local storage
    app.getSessionToken();

    // start token renewal loop
    app.tokenRenewalLoop();

    // load data on page
    app.loadDataOnPage();
};

// call app initialization as soon as window loads
window.onload = () => {
    app.init();
};