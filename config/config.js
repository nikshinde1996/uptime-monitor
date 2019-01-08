/**
 * Create and export configuration variables
 */

// container for all the environments
var environments = {};

// Development environment
environments.development = {
    'port' : 3000,
    'envName' : 'development'
}

// Staging environment
environments.staging = {
    'port' : 5000,
    'envName' : 'staging'
}

// Production environment
environments.production = {
    'port' : 7000,
    'envName' : 'production'
}

var currentEnv = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// set NODE_ENV as 'development' (default), incase currentEnv does not match to any above listing
var envToExport = typeof(environments[currentEnv]) == 'object' ? environments[currentEnv] : environments.development;

// export the module
module.exports = envToExport;
