import mongoose from 'mongoose';

export const validateCreateBook = (req, res, next) => {
    const { title, category, author } = req.body;
    const errors = [];

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        errors.push('Title is required');
    }

    if (!category || !['Novel', 'Poem'].includes(category)) {
        errors.push('Category must be either Novel or Poem');
    }

    if (!author || !mongoose.Types.ObjectId.isValid(author)) {
        errors.push('Valid author ID is required');
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
    const allowedFields = ['title', 'category', 'rating', 'draft'];
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

    if (req.body.category && !['Novel', 'Poem'].includes(req.body.category)) {
        errors.push('Category must be either Novel or Poem');
    }

    if (req.body.rating !== undefined && ![1, 2, 3].includes(req.body.rating)) {
        errors.push('Rating must be 1, 2, or 3');
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
