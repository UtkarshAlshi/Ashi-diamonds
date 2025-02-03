var { expressjwt: jwt } = require("express-jwt");
const config = require('../config.json');

module.exports = expressJwt;

function expressJwt() {
    const { secret } = config;
    var expJwt =  jwt({ secret, algorithms: ['HS256'] }).unless({
        
        path: [
            // public routes that don't require authentication
             '/api/v1/test'
            // '/api/v1/users/register',
            // '/api/v1/lookups/countries',
            // '/api/v1/users/activate',
            // /\/api\/v1\/lookups\/states\/[a-zA-Z0-9]+/,
            // /\/api\/v1\/users\/invite\/details\/[a-zA-Z0-9]+/

        ]
    });
    return expJwt ; 
}
