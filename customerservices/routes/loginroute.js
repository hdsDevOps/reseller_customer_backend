const express = require('express');
const router = express.Router();
const logindetails = require('../services/loginservice.js');

// Admin login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    res.status(200).send(await logindetails.login({ email, password }));
});

// Verify OTP route
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    res.status(200).send(await logindetails.verifyOtp({ email, otp }));
});

// Generate new OTP route
router.post('/generate-new-otp', async (req, res) => {
    const { email } = req.body;
    res.status(200).send(await logindetails.generateNewOtp({ email }));
});

module.exports = router;