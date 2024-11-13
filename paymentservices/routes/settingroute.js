const express = require('express');
const router = express.Router();
const settingService = require('../services/settingservice');
const { verifyToken } = require('../middleware/auth');


/**
 * @swagger
 * /setting/api/v1/edit_staff:
 *   post:
 *     summary: Edit an existing staff record from customer portal
 *     tags: [Setting]
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
 * /setting/api/v1/delete_staff:
 *   post:
 *     summary: Delete an existing staff record from customer portal
 *     tags: [Setting]
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