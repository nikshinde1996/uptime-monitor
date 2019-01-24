// TEST RUNNER - awesome
var helper = require('../lib/helpers');
var assert = require('assert');

// override NODE_ENV for testing
process.env.NODE_ENV = 'testing';

// initiate the container
var _app = {};

_app.tests = {
    'unit' : {}
};

_app.tests.api = require('./api_test');

// count all the tests in running file 
_app.countTest = () => {
    var count = 0;
    for(var key in _app.tests) {
        if(_app.tests.hasOwnProperty(key)) {
            var subTests = _app.tests[key];
            for(var testName in subTests) {
                if(subTests.hasOwnProperty(testName)) {
                    count++;
                }
            }
        }
    }
    return count;
};

// Produce Test reports
_app.produceTestReports = (limit, successes, errors) => {
    console.log('---------------BEGIN TEST REPORT-----------------');
    console.log('');
    console.log('Totat Tests : ', limit);
    console.log('Passed Tests : ', successes);
    console.log('Failed Tests : ', errors.length);
    console.log('');
    console.log('----------------END TEST REPORT-----------------');
    process.exit(0);
};

// run all the tests loggin the success/failures
_app.runTests = () => {
    var errors = [];
    var successes = 0, counter = 0;
    var limit = _app.countTest();

    for(var key in _app.tests) {
        if(_app.tests.hasOwnProperty(key)) {
            var subTests = _app.tests[key];
            // loop for each test
            for(var testName in subTests) {
                if(subTests.hasOwnProperty(testName)) {
                    (() => {
                        var tempTestName = testName;
                        var testValue = subTests[testName];

                        // call the test
                        try {
                            testValue(() => {
                                // callback called without throwing, then
                                // all assertions are passed
                                console.log('\x1b[32m%s\x1b[0m', tempTestName);
                                counter++;
                                successes++;
                                if(counter === limit){
                                    // all tests are done, produce test reports
                                    _app.produceTestReports(limit, successes, errors);
                                }
                            });
                        }catch(e) {
                            // track the count and error log
                            console.log('\x1b[31m%s\x1b[0m', tempTestName);
                            counter++;
                            errors.push({
                                'test-name' : tempTestName,
                                'error' : e
                            });
                            if(counter === limit){
                                // all tests are done, produce test reports
                                _app.produceTestReports(limit, successes, errors);
                            }
                        }
                    })();
                }
            }
        }
    }
};

// Run the tests
_app.runTests();