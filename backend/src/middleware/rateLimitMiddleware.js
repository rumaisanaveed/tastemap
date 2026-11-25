const rateLimit = require("express-rate-limit");

// Limit email verification attempts
const verificationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many verification attempts. Please try again later."
    }
});

// Limit verification email requests
const resendVerificationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many verification emails requested. Please try again later."
    }
});

module.exports = {
    verificationLimiter,
    resendVerificationLimiter
};
