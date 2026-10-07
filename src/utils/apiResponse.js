/**
 * Send a standardized success response.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {*} [data=null] - Optional payload
 */
export const sendSuccess = (res, statusCode, message, data = null) => {
    const response = { success: true, message };
    if (data !== null) response.data = data;
    return res.status(statusCode).json(response);
};

/**
 * Send a standardized error response.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {*} [error=null] - Optional error details
 */
export const sendError = (res, statusCode, message, error = null) => {
    const response = { success: false, message };
    if (error !== null) response.error = error;
    return res.status(statusCode).json(response);
};
