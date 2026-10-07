import mongoose from 'mongoose';

export const validateCreateComment = (req, res, next) => {
    const { userId, bookId, content } = req.body;
    const errors = [];

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        errors.push('Valid user ID is required');
    }

    if (!bookId || !mongoose.Types.ObjectId.isValid(bookId)) {
        errors.push('Valid book ID is required');
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
        errors.push('Comment content is required');
    }

    if (errors.length > 0) {
        return res
            .status(400)
            .json({ success: false, message: 'Validation failed', errors });
    }

    next();
};
