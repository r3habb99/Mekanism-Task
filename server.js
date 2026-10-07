import 'dotenv/config';

import express from 'express';
import connectDB from './src/config/db.js';
import authMiddleware from './src/middlewares/auth.middleware.js';
import { authRoutes, bookRoutes, commentRoutes } from './src/routes/index.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Parse JSON bodies (Express 5 built-in — no body-parser needed)
app.use(express.json());

// Health check
app.get('/test', (req, res) => {
    res.status(200).json({ success: true, message: 'API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', authMiddleware, bookRoutes);
app.use('/api/comments', authMiddleware, commentRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

// Connect DB first, then start server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server started on port: ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();