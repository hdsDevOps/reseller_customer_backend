const express = require('express');
const router = express.Router();
const customerService = require('../services/customerservice');


/**
 * @swagger
 * /customerservices/customer/api/v1/login:
 *   post:
 *     summary: Login to customer portal
 *     tags: [Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, OTP sent
 *       400:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
  const result = await customerService.loginCustomer(req.body);
  res.status(result.status).json(result);
});

/**
 * @swagger
 * /customerservices/customer/api/v1/registration:
 *   post:
 *     summary: Register new customer
 *     tags: [Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - business_name
 *               - email
 *               - state
 *               - city
 *               - zipcode
 *               - password
 *               - street_name
 *               - region
 *               - phone_no
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               business_name:
 *                 type: string
 *               email:
 *                 type: string
 *               state:
 *                 type: string
 *               city:
 *                 type: string
 *               zipcode:
 *                 type: string
 *               password:
 *                 type: string
 *               street_name:
 *                 type: string
 *               region:
 *                 type: string
 *               phone_no:
 *                 type: string
 *     responses:
 *       200:
 *         description: Customer registered successfully
 *       400:
 *         description: Bad request
 */
router.post('/registration', async (req, res) => {
  const result = await customerService.registerCustomer(req.body);
  // res.status(result.status).json(result);
  res.status(result.status).json({status: result.status, message: result.message, customer_id: result.userId });
});


/**
 * @swagger
 * /customer/api/v1/otpverify:
 *   post:
 *     summary: Verify OTP for login
 *     tags: [Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer_id
 *               - otp
 *             properties:
 *               customer_id:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid OTP
 */
router.post('/otpverify', async (req, res) => {
  const result = await customerService.verifyOTP(req.body);
  res.status(result.status).json(result);
});

// /**
//  * @swagger
//  * /customer/api/v1/register_otpverify:
//  *   post:
//  *     summary: Verify OTP for customer registration
//  *     tags: [Customer]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - customer_id
//  *               - otp
//  *             properties:
//  *               customer_id:
//  *                 type: string
//  *               otp:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: OTP verified successfully
//  *       400:
//  *         description: Invalid OTP
//  */
// router.post('/register_otpverify', async (req, res) => {
//   const result = await customerService.verifyOTP(req.body);
//   res.status(result.status).json(result);
// });


/**
 * @swagger
 * /customer/api/v1/forgetpassword:
 *   post:
 *     summary: Request password reset
 *     tags: [Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset OTP sent
 *       400:
 *         description: Email not found
 */
router.post('/forgetpassword', async (req, res) => {
  const result = await customerService.requestPasswordReset(req.body);
  res.status(result.status).json(result);
});

/**
 * @swagger
 * /customer/api/v1/verify_forgetpassword_otp:
 *   post:
 *     summary: Verify forget password OTP
 *     tags: [Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid OTP
 */
router.post('/verify_forgetpassword_otp', async (req, res) => {
  const result = await customerService.verifyForgetPasswordOTP(req.body);
  res.status(result.status).json(result);
});

/**
 * @swagger
 * /customer/api/v1/reset_password:
 *   post:
 *     summary: Reset password
 *     tags: [Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid request
 */
router.post('/reset_password', async (req, res) => {
  const result = await customerService.resetPassword(req.body);
  res.status(result.status).json(result);
});

/**
 * @swagger
 * /customer/api/v1/resed_otp:
 *   post:
 *     summary: Resend OTP
 *     tags: [Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer_id              
 *             properties:
 *               customer_id:
 *                 type: string            
 *     responses:
 *       200:
 *         description: OTP send successfully
 *       400:
 *         description: Invalid request
 */
router.post('/resend_otp', async (req, res) => {
  const result = await customerService.resendOTP(req.body);
  res.status(result.status).json(result);
});


module.exports = router;