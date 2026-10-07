import 'dotenv/config';

import express from 'express';
import connectDB from './src/config/db.js';
import apiRoutes from './src/routes/index.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Parse JSON bodies (Express 5 built-in)
app.use(express.json());

// Health check
app.get('/test', (req, res) => {
    res.status(200).json({ success: true, message: 'API is running' });
});

// Centralized API routes
app.use('/api', apiRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
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