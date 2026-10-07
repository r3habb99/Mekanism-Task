export const validateRegister = (req, res, next) => {
    const { name, email, password } = req.body;
    const errors = [];

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        errors.push('Name is required');
    }

    if (!email || typeof email !== 'string') {
        errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Invalid email format');
    }

    if (!password || typeof password !== 'string') {
        errors.push('Password is required');
    } else if (password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }

    if (errors.length > 0) {
        return res
            .status(400)
            .json({ success: false, message: 'Validation failed', errors });
    }

    next();
};

export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if (!email || typeof email !== 'string') {
        errors.push('Email is required');
    }

    if (!password || typeof password !== 'string') {
        errors.push('Password is required');
    }

    if (errors.length > 0) {
        return res
            .status(400)
            .json({ success: false, message: 'Validation failed', errors });
    }

    next();
};
