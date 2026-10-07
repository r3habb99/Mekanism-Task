import mongoose from 'mongoose';

export const validateCreateComment = (req, res, next) => {
    const { bookId, content, rating } = req.body;
    const errors = [];

    if (!bookId || !mongoose.Types.ObjectId.isValid(bookId)) {
        errors.push('Valid book ID is required');
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
        errors.push('Comment content is required');
    }

    if (rating !== undefined) {
        const numericRating = Number(rating);
        if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
            errors.push('Rating must be an integer between 1 and 5');
        }
    }

    if (errors.length > 0) {
        return res
            .status(400)
            .json({ success: false, message: 'Validation failed', errors });
    }

    next();
};

export const validateModerateComment = (req, res, next) => {
    const { status } = req.body;
    const errors = [];

    if (!status || !['approved', 'rejected'].includes(status)) {
        errors.push("Status must be either 'approved' or 'rejected'");
    }

    if (errors.length > 0) {
        return res
            .status(400)
            .json({ success: false, message: 'Validation failed', errors });
    }

    next();
};

export const validateCommentId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res
            .status(400)
            .json({ success: false, message: 'Invalid comment ID format' });
    }

    next();
};
