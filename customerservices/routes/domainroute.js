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


/**
 * @swagger
 * /domain/api/v1/domain-list:
 *   post:
 *     summary: Get all domain for a customer
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
 *             properties:
 *               customer_id:
 *                 type: string
 *                                   
 *     responses:
 *       200:
 *         description: Domains fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/domain-list", verifyToken, async (req, res) => {
  const result = await domainService.domainlist(req.body);
  res.status(result.status).json(result);
});

/**
 * @swagger
 * /domain/api/v1/delete-domain:
 *   post:
 *     summary: Delete domain for a customer
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
 *               - domain_id             
 *             properties:
 *               domain_id:
 *                 type: string                           
 *     responses:
 *       200:
 *         description: Domain deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/delete-domain", verifyToken, async (req, res) => {
  const result = await domainService.deletedomain(req.body);
  res.status(result.status).json(result);
});

/**
 * @swagger
 * /domain/api/v1/change-domain-type:
 *   post:
 *     summary: Change domain type for a customer
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
 *               - domain_id
 *               - domain_type             
 *             properties:
 *               domain_id:
 *                 type: string                           
 *               domain_type:
 *                 type: string                           
 *     responses:
 *       200:
 *         description: Domain type change successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/change-domain-type", verifyToken, async (req, res) => {
  const result = await domainService.changedomaintype(req.body);
  res.status(result.status).json(result);
});

/**
 * @swagger
 * /domain/api/v1/change-domain-type:
 *   post:
 *     summary: Change domain type for a customer
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
 *               - domain_id
 *               - renew_status             
 *             properties:
 *               domain_id:
 *                 type: string                           
 *               renew_status:
 *                 type: string                           
 *     responses:
 *       200:
 *         description: Domain type change successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/change-renew-status", verifyToken, async (req, res) => {
  const result = await domainService.changerenewstatus(req.body);
  res.status(result.status).json(result);
});

/**
 * @swagger
 * /domain/api/v1/change-domain-type:
 *   post:
 *     summary: Change domain type for a customer
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
 *               - domain_id
 *               - subscription_status             
 *             properties:
 *               domain_id:
 *                 type: string                           
 *               subscription_status:
 *                 type: string                           
 *     responses:
 *       200:
 *         description: Domain type change successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/change-subscription-status", verifyToken, async (req, res) => {
  const result = await domainService.changesubscriptionstatus(req.body);
  res.status(result.status).json(result);
});


module.exports = router;