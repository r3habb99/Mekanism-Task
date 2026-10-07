import 'dotenv/config';

import express from 'express';
import connectDB from './src/config/db.js';
import apiRoutes from './src/routes/index.js';
import logger, { requestLogger } from './src/utils/logger.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Parse JSON bodies (Express 5 built-in)
app.use(express.json());

// Log incoming HTTP requests with Winston
app.use(requestLogger);

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
    logger.error(err.stack || err.message);
    res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

// Connect DB first, then start server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            logger.info(`Server started on port: http://localhost:${PORT}`);
        });
    } catch (error) {
        logger.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
};

startServer();