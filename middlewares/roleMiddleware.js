// const jwt = require("jsonwebtoken");

// const authorize = (...roles) => {
//     return (req, res, next) => {
//       if (!roles.includes(req.user.role)) {
//         return res.status(403).json({ message: "Access denied" });
//       }
//       next();
//     };
//   };
  
//   module.exports = authorize;
  
const jwt = require("jsonwebtoken");

const authorize = (...roles) => {
    return (req, res, next) => {
        console.log('Authorize middleware - Allowed roles:', roles);
        console.log('Authorize middleware - req.user:', req.user);
        if (!req.user || !req.user.role) {
            console.log('Authorize middleware - User or role not found in req.user');
            return res.status(403).json({ message: "Access denied - No user info" });
        }
        console.log('Authorize middleware - User role:', req.user.role);
        if (!roles.includes(req.user.role)) {
            console.log('Authorize middleware - Role', req.user.role, 'not in allowed roles', roles);
            return res.status(403).json({ message: "Access denied - Incorrect role" });
        }
        console.log('Authorize middleware - Access granted');
        next();
    };
};

module.exports = authorize;