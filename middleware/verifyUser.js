import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";

export const verifyToken = (req, res, next) => {
  // Get token from cookies
  const token =
    req.cookies?.access_token ||
    (req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  // If token does not exist, return error
  if (!token) return next(errorHandler(401, "Unauthorized"));

  // Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // Differentiate between different types of JWT errors
      let message = 'Forbidden - Invalid token';
      if (err.name === 'TokenExpiredError') {
        message = 'Unauthorized - Token expired';
      } else if (err.name === 'JsonWebTokenError') {
        message = 'Forbidden - Malformed token';
      }
      return next(errorHandler(403, message));
    }
    
    // Attach the decoded user to the request object
    req.user = decoded;
    next();
  });
};
