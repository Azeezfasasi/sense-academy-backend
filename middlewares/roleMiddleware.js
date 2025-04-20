const jwt = require("jsonwebtoken");

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            // console.log('Authorize middleware - User or role not found in req.user');
            return res.status(403).json({ message: "Access denied - No user info" });
        }
        // console.log('Authorize middleware - User role:', req.user.role);
        if (!roles.includes(req.user.role)) {
            // console.log('Authorize middleware - Role', req.user.role, 'not in allowed roles', roles);
            return res.status(403).json({ message: "Access denied - Incorrect role" });
        }
        // console.log('Authorize middleware - Access granted');
        next();
    };
};

module.exports = authorize;