import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifyToken = (req, res, next) => {
  // Get token from cookies, authorization header, or bearer token
  const token = req.cookies?.access_token || 
                req.headers['authorization']?.split(' ')[1] || 
                (req.authorization && req.authorization.bearer);
                
  // If token does not exist, return error
  if (!token) return next(errorHandler(401, 'Unauthorized'));

  // Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    // If token is invalid, return error
    if (err) return next(errorHandler(403, 'Forbidden'));
    // If token is valid, set user in req object and call next middleware
    req.user = user;
    // Call next function in this case is the updateUser function from user.route.js
    next();
  });
};