import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const register = async (req, res) => {
    try {
        const { name, age, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendError(res, 409, 'User already exists with this email');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            age,
            email,
            password: hashedPassword,
            role,
        });

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        return sendSuccess(res, 201, 'User created successfully', userResponse);
    } catch (error) {
        return sendError(res, 500, 'Error creating user', error.message);
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return sendError(res, 400, 'Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return sendError(res, 400, 'Invalid credentials');
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return sendSuccess(res, 200, 'Login successful', {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        return sendError(res, 500, 'Server error', error.message);
    }
};
