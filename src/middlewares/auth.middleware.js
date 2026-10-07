import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res
            .status(401)
            .json({ success: false, message: 'Access denied, no token provided' });
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
        return res
            .status(401)
            .json({ success: false, message: 'Invalid or expired token' });
    }
};

export default authMiddleware;
