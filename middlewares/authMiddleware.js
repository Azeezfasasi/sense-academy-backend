const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token;

  if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(" ")[1]; // Extract token part
  } else {
      token = authHeader;
  }
  
  if (!token) {
    console.log("No token found."); // Added logging
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Token decoded successfully:", decoded); // Added logging
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message); // Added logging
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token signature' });
    } else if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired' });
    } else {
      return res.status(401).json({ message: 'Invalid token' });
    }
  }
};

module.exports = { authenticate };