import mongoose from 'mongoose';

export const validateCreateCategory = (req, res, next) => {
    const { name } = req.body;
    const errors = [];

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        errors.push('Category name is required');
    }

    if (errors.length > 0) {
        return res
            .status(400)
            .json({ success: false, message: 'Validation failed', errors });
    }

    next();
};

export const validateUpdateCategory = (req, res, next) => {
    const { name, description } = req.body;
    const errors = [];
    const bodyKeys = Object.keys(req.body);

    if (bodyKeys.length === 0) {
        errors.push('At least one field (name or description) is required for update');
    }

    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
        errors.push('Category name cannot be empty');
    }

    if (description !== undefined && typeof description !== 'string') {
        errors.push('Description must be a string');
    }

    if (errors.length > 0) {
        return res
            .status(400)
            .json({ success: false, message: 'Validation failed', errors });
    }

    next();
};

export const validateCategoryId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res
            .status(400)
            .json({ success: false, message: 'Invalid category ID format' });
    }

    next();
};
