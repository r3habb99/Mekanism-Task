import mongoose from 'mongoose';

export const validateCreateBook = (req, res, next) => {
    const { title, content, category, draft } = req.body;
    const errors = [];

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        errors.push('Title is required');
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
        errors.push('Book content is required');
    }

    if (!category || !mongoose.Types.ObjectId.isValid(category)) {
        errors.push('Valid category ID is required');
    }

    if (draft !== undefined && typeof draft !== 'boolean') {
        errors.push('Draft must be a boolean');
    }

    if (errors.length > 0) {
        return res
            .status(400)
            .json({ success: false, message: 'Validation failed', errors });
    }

    next();
};

export const validateUpdateBook = (req, res, next) => {
    const errors = [];
    const allowedFields = ['title', 'description', 'content', 'category', 'draft'];
    const bodyKeys = Object.keys(req.body);

    if (bodyKeys.length === 0) {
        errors.push('At least one field is required for update');
    }

    const invalidFields = bodyKeys.filter(
        (key) => !allowedFields.includes(key)
    );
    if (invalidFields.length > 0) {
        errors.push(
            `Invalid fields: ${invalidFields.join(', ')}. Allowed: ${allowedFields.join(', ')}`
        );
    }

    if (req.body.title !== undefined && (typeof req.body.title !== 'string' || req.body.title.trim().length === 0)) {
        errors.push('Title cannot be empty');
    }

    if (req.body.content !== undefined && (typeof req.body.content !== 'string' || req.body.content.trim().length === 0)) {
        errors.push('Content cannot be empty');
    }

    if (req.body.category !== undefined && !mongoose.Types.ObjectId.isValid(req.body.category)) {
        errors.push('Valid category ID is required');
    }

    if (req.body.draft !== undefined && typeof req.body.draft !== 'boolean') {
        errors.push('Draft must be a boolean');
    }

    if (errors.length > 0) {
        return res
            .status(400)
            .json({ success: false, message: 'Validation failed', errors });
    }

    next();
};

export const validateBookId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res
            .status(400)
            .json({ success: false, message: 'Invalid book ID format' });
    }

    next();
};
