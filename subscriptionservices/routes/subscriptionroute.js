const express = require('express');
const router = express.Router();
const subscriptionservice = require('../services/subscriptionservice');

/**
 * @swagger
 * /subscriptionservices/subscription/api/v1/get_customer_subscription:
 *   post:
 *     summary: Get subscription
 *     tags: [Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer_id
 *               - start_date
 *               - end_date
 *               - domain_name
 *             properties:
 *               customer_id:
 *                 type: string
 *               start_date:
 *                 type: string
 *               end_date:
 *                 type: string
 *               domain_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Customer subscription fetched successfully
 *       400:
 *         description: Bad request
 */
router.post('/get_customer_subscription', async (req, res) => {
  const result = await subscriptionservice.getCustomerSubscription(req.body);
  // res.status(result.status).json(result);
  res.status(result.status).json(result);
});
/**
 * @swagger
 * /subscriptionservices/subscription/api/v1/add_customer_subscription:
 *   post:
 *     summary: Add new subscription
 *     tags: [Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_type
 *               - payment_cycle
 *               - customer_id
 *               - description
 *               - domain
 *               - last_payment
 *               - next_payment
 *               - payment_method
 *               - subscription_status
 *             properties:
 *               product_type:
 *                 type: string
 *               payment_cycle:
 *                 type: string
 *               customer_id:
 *                 type: string
 *               description:
 *                 type: string
 *               domain:
 *                 type: array
 *               last_payment:
 *                 type: string
 *               next_payment:
 *                 type: string
 *               payment_method:
 *                 type: string
 *               subscription_status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Customer subscription added successfully
 *       400:
 *         description: Bad request
 */
router.post('/add_customer_subscription', async (req, res) => {
  const result = await subscriptionservice.addCustomerSubscription(req.body);
  // res.status(result.status).json(result);
  res.status(result.status).json(result);
});

/**
 * @swagger
 * /user/api/v1/update_customer_subscription:
 *   post:
 *     summary: update customer subscription
 *     tags: [Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subscription_id
 *               - payment_method
 *               - payment_cycle
 *               - subsctription_status
 *               - billing_status
 *             properties:
 *               subscription_id:
 *                 type: string
 *               payment_method:
 *                 type: string
 *               subsctription_status:
 *                 type: string
 *               billing_status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Customer subscription updated successfully
 *       400:
 *         description: Bad request
 */
router.post('/update_customer_subscription', async (req, res) => {
  const result = await subscriptionservice.updateCustomerSubscription(req.body);
  // res.status(result.status).json(result);
  res.status(result.status).json(result);
});

module.exports = router;