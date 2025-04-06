const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Get the Authorization header from the request
    const authHeader = req.get('Authorization');

    // If no token is provided, block access
    if (!authHeader) {
        const error = new Error('Not authenticated.');
        error.statusCode = 401;
        throw error;
    }

    // Extract the token from the "Bearer <token>" format
    const token = authHeader.split(' ')[1];
    let decodedToken;

    try {
        // Verify the token using the JWT secret key
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        // If verification fails due to server error or invalid token
        err.statusCode = 500;
        throw err;
    }

    // If token is not valid or cannot be decoded
    if (!decodedToken) {
        const error = new Error('Not Authenticated');
        error.statusCode = 401;
        throw error;
    }
    // Attach the decoded user ID to the request for downstream use
    req.userId = decodedToken.userId;
    next();
};