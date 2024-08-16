const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { checkSchema } = require('express-validator');
const { requestPasswordReset, verifyOtp, resetPassword } = require('../services/forgotpasswordservice.js');
const { emailValidationSchema, passwordResetValidationSchema } = require('../validationScema.js');

// Rate limiter to prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many requests, please try again later.'
});

router.use(limiter);

// Request Password Reset
router.post('/request-password-reset', checkSchema(emailValidationSchema), requestPasswordReset);

// Verify OTP
router.post('/verify-otp', verifyOtp);

// Reset Password
router.post('/reset-password', checkSchema(passwordResetValidationSchema), resetPassword);

module.exports = router;