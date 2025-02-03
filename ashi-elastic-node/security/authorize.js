const jwt = require('express-jwt');
const { secret } = require('config.json');


module.exports = authorize;


function authorize(roles = []) {
    // roles param can be a single role string (e.g. Role.User or 'User') 
    // or an array of roles (e.g. [Role.Admin, Role.User] or ['Admin', 'User'])

    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        // authenticate JWT token and attach user to request object (req.user)
        //jwt({ secret, algorithms: ['RS256'] }),

        // authorize based on user role
        (req, res, next) => {
            if (roles.length) {
                const found = roles.some(r => req.auth.roles.indexOf(r) >= 0)
                
                if (!found) {
                    // user's role is not authorized
                    return res.status(401).json({ message: 'Unauthorized' });
                }

            }
            req.username = req.auth.email ; 
            next();
        }
    ];
}


