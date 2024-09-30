const express = require('express');
const router = express.Router();
const homeService = require('../services/homeservice');

/**
 * @swagger
 * /home/api/v1/contactform:
 *   post:
 *     summary: Submit contact form
 *     tags: [Home]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *               - phone_no
 *               - subject
 *               - message
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone_no:
 *                 type: string
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contact form submitted successfully
 *       400:
 *         description: Bad request
 */
router.post('/contactform', async (req, res) => {
  const result = await homeService.submitContactForm(req.body);
  res.status(result.status).json(result);
});

/**
 * @swagger
 * /home/api/v1/settings:
 *   post:
 *     summary: Get settings data list for customer
 *     tags: [Home]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_type
 *               - user_id
 *             properties:
 *               user_type:
 *                 type: string
 *               user_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Settings data retrieved successfully
 *       400:
 *         description: Bad request
 */
router.post('/settings', async (req, res) => {
  const result = await homeService.getSettings(req.body);
  res.status(result.status).json(result);
});

/**
 * @swagger
 * /home/api/v1/addsetting:
 *   post:
 *     summary: Add new setting data for a customer
 *     tags: [Home]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_type
 *               - user_id
 *               - permissions
 *             properties:
 *               user_type:
 *                 type: string
 *               user_id:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Setting added successfully
 *       400:
 *         description: Bad request
 */
router.post('/addsetting', async (req, res) => {
  const result = await homeService.addSetting(req.body);
  res.status(result.status).json(result);
});

/**
 * @swagger
 * /home/api/v1/edit_setting:
 *   post:
 *     summary: Edit existing setting data
 *     tags: [Home]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Setting updated successfully
 *       400:
 *         description: Bad request
 */
router.post('/edit_setting', async (req, res) => {
  const result = await homeService.editSetting(req.body);
  res.status(result.status).json(result);
});

/**
 * @swagger
 * /home/api/v1/delete_setting:
 *   post:
 *     summary: Delete existing setting data
 *     tags: [Home]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Setting deleted successfully
 *       400:
 *         description: Bad request
 */
router.post('/delete_setting', async (req, res) => {
  const result = await homeService.deleteSetting(req.body);
  res.status(result.status).json(result);
});

module.exports = router;