import jwt from 'jsonwebtoken';
import { sendError } from '../utils/apiResponse.js';

export const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return sendError(res, 401, 'Access denied, no token provided');
    }

    // Support both "Bearer <token>" and raw token formats
    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return sendError(res, 401, 'Invalid or expired token');
    }
};

/**
 * Optional authentication: attaches req.user if valid token present,
 * but proceeds without error if unauthenticated.
 */
export const optionalAuth = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return next();
    }

    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
    } catch {
        // If invalid, proceed as guest
    }
    next();
};

/**
 * Role-Based Access Control middleware.
 * @param  {...string} roles - Allowed roles (e.g. 'author', 'admin', 'reader')
 */
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return sendError(res, 401, 'Unauthorized, please authenticate first');
        }

        if (!roles.includes(req.user.role)) {
            return sendError(
                res,
                403,
                `Forbidden: Role '${req.user.role}' is not allowed to access this resource`
            );
        }

        next();
    };
};

export default authMiddleware;
