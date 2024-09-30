const express = require('express');
const router = express.Router();
const customerService = require('../services/customerservice');

/**
 * @swagger
 * /customer/api/v1/registration:
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
  res.status(result.status).json({ message: result.message, userId: result.userId });
});

/**
 * @swagger
 * /customer/api/v1/register_otpverify:
 *   post:
 *     summary: Verify OTP for customer registration
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
router.post('/register_otpverify', async (req, res) => {
  const result = await customerService.verifyOTP(req.body);
  res.status(result.status).json(result);
});

module.exports = router;