const express = require("express");
const router = express.Router();
const domainService = require("../services/domainservice");
const { verifyToken } = require("../middleware/auth");


/**
 * @swagger
 * /domain/api/v1/adddomain:
 *   post:
 *     summary: Add new domain for a customer
 *     tags: [domain]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer_id
 *               - domain_name
 *               - domain_type
 *               - subscription_id
 *               - business_email
 *               - license_usage
 *               - plan
 *               - payment_method
 *               - domain_status
 *             properties:
 *               customer_id:
 *                 type: string
 *               domain_name:
 *                 type: string
 *               domain_type:
 *                 type: string
 *               subscription_id:
 *                 type: string              
 *               business_email:
 *                 type: string              
 *               license_usage:
 *                 type: string              
 *               plan:
 *                 type: string              
 *               payment_method:
 *                 type: string              
 *               domain_status:
 *                 type: string              
 *     responses:
 *       200:
 *         description: Domain added successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/adddomain", verifyToken, async (req, res) => {
  const result = await domainService.adddomain(req.body);
  res.status(result.status).json(result);
});



module.exports = router;