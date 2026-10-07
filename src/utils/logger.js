import winston from 'winston';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Custom console format for development
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
    return `[${timestamp}] [${level}]: ${stack || message}`;
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true })
    ),
    transports: [
        // Console output
        new winston.transports.Console({
            format: combine(
                colorize(),
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                consoleFormat
            ),
        }),
        // Error logs in file
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: combine(timestamp(), json()),
        }),
        // Combined logs in file
        new winston.transports.File({
            filename: 'logs/combined.log',
            format: combine(timestamp(), json()),
        }),
    ],
    exitOnError: false,
});

/**
 * Express middleware to log incoming HTTP requests
 */
export const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
        if (res.statusCode >= 500) {
            logger.error(message);
        } else if (res.statusCode >= 400) {
            logger.warn(message);
        } else {
            logger.info(message);
        }
    });
    next();
};

export default logger;
