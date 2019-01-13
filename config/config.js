/**
 * Create and export configuration variables
 */

// container for all the environments
var environments = {};

// Development environment
environments.development = {
    'httpPort' : 3000,
    'httpsPort' : 3001,
    'envName' : 'development',
    'hashingSecret' : 'HHJhjhhghJBNM',
    'maxChecks' : 5
}

// Staging environment
environments.staging = {
    'httpPort' : 5000,
    'httpsPort' : 5001,
    'envName' : 'staging',
    'hashingSecret' : 'wehuUHJJHjbhb',
    'maxChecks' : 5
}

// Production environment
environments.production = {
    'httpPort' : 7000,
    'httpsPort' : 7001,
    'envName' : 'production',
    'hashingSecret' : 'GHGHjhjhjhJHHJ',
    'maxChecks' : 5
}

var currentEnv = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// set NODE_ENV as 'development' (default), incase currentEnv does not match to any above listing
var envToExport = typeof(environments[currentEnv]) == 'object' ? environments[currentEnv] : environments.development;

// export the module
module.exports = envToExport;