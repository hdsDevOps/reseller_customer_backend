const express = require('express');
const router = express.Router();
const homeService = require('../services/homeservice');
const settingService = require('../services/settingservice');
const { verifyToken } = require('../middleware/auth');

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
router.post('/settings', verifyToken, async (req, res) => {
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
router.post('/addsetting', verifyToken, async (req, res) => {
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
router.post('/edit_setting', verifyToken, async (req, res) => {
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
router.post('/delete_setting', verifyToken, async (req, res) => {
  const result = await homeService.deleteSetting(req.body);
  res.status(result.status).json(result);
});

/**
 * @swagger
 * /home/api/v1/add_staff:
 *   post:
 *     summary: Add new staff from customer portal
 *     tags: [Home]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - first_name
 *               - last_name
 *               - email
 *               - phone_no
 *               - user_type_id
 *             properties:
 *               id:
 *                 type: string
 *                 description: Customer ID
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone_no:
 *                 type: string
 *               user_type_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Staff added successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/add_staff', verifyToken, async (req, res) => {
  try {
    const result = await homeService.addStaff(req.body);
    res.status(result.status).json(result);
  } catch (error) {
    res.status(500).json({ status: 500, message: "Error adding staff", error: error.message });
  }
});

/**
 * @swagger
 * /setting/api/v1/staff_list:
 *   post:
 *     summary: Get existing staff list for a customer
 *     tags: [Home]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - user_type_id
 *             properties:
 *               id:
 *                 type: string
 *                 description: Customer ID
 *               user_type_id:
 *                 type: string
 *               search_text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Staff list retrieved successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/staff_list', verifyToken, async (req, res) => {
  try {
    const result = await homeService.getStaffList(req.body);
    res.status(result.status).json(result);
  } catch (error) {
    res.status(500).json({ status: 500, message: "Error retrieving staff list", error: error.message });
  }
});

/**
 * @swagger
 * /home/api/v1/edit_staff:
 *   post:
 *     summary: Edit an existing staff record from customer portal
 *     tags: [Home]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - first_name
 *               - last_name
 *               - email
 *               - phone_no
 *               - user_type_id
 *             properties:
 *               id:
 *                 type: string
 *                 description: Record ID
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone_no:
 *                 type: string
 *               user_type_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Staff record updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Staff record not found
 *       500:
 *         description: Internal server error
 */
router.post('/edit_staff',  verifyToken, async (req, res) => {
  try {
    const result = await homeService.editStaff(req.body);
    res.status(result.status).json(result);
  } catch (error) {
    res.status(500).json({ status: 500, message: "Error editing staff", error: error.message });
  }
});

/**
 * @swagger
 * /home/api/v1/delete_staff:
 *   post:
 *     summary: Delete an existing staff record from customer portal
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
 *                 description: Record ID
 *     responses:
 *       200:
 *         description: Staff record deleted successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Staff record not found
 *       500:
 *         description: Internal server error
 */
router.post('/delete_staff',  verifyToken, async (req, res) => {
  try {
    const result = await homeService.deleteStaff(req.body);
    res.status(result.status).json(result);
  } catch (error) {
    res.status(500).json({ status: 500, message: "Error deleting staff", error: error.message });
  }
});

/**
 * @swagger
 * /setting/api/v1/voucherlist:
 *   get:
 *     summary: Get all available vouchers
 *     tags: [Setting]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available vouchers
 *       401:
 *         description: Unauthorized
 */
router.get('/voucherlist', verifyToken, async (req, res) => {
  const result = await settingService.getVoucherList();
  res.status(result.status).json(result);
});


module.exports = router;