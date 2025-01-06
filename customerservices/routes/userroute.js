const express = require("express");
const router = express.Router();
const userService = require("../services/userservice");
const { verifyToken } = require("../middleware/auth");

/**
 * @swagger
 * /user/api/v1/voucherlist:
 *   post:
 *     summary: Get all emails for a customer
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
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
 *         description: List of emails for the customer
 *       401:
 *         description: Unauthorized
 */
router.post("/voucherlist", verifyToken, async (req, res) => {
  const result = await userService.getCustomerEmails(req.body);
  res.status(result.status).json(result);
});

/**
 * @swagger
 * /user/api/v1/addemail:
 *   post:
 *     summary: Add new email for a customer
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - domain_id
 *               - first_name
 *               - last_name
 *               - email
 *               - password
 *             properties:
 *               id:
 *                 type: string
 *               domain_id:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email added successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/addemail", verifyToken, async (req, res) => {
  const result = await userService.addEmail(req.body);
  res.status(result.status).json(result);
});

/**
 * @swagger
 * /user/api/v1/makeadmin:
 *   post:
 *     summary: Make an email admin
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - rec_id
 *             properties:
 *               id:
 *                 type: string
 *               rec_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email made admin successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/makeadmin", verifyToken, async (req, res) => {
  const result = await userService.makeEmailAdmin(req.body);
  res.status(result.status).json(result);
});

/**
 * @swagger
 * /user/api/v1/resetemailpassword:
 *   post:
 *     summary: Reset email password
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - rec_id
 *               - password
 *             properties:
 *               id:
 *                 type: string
 *               rec_id:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email password reset successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/resetemailpassword", verifyToken, async (req, res) => {
  const result = await userService.resetEmailPassword(req.body);
  res.status(result.status).json(result);
});

/**
 * @swagger
 * /user/api/v1/updateprofile:
 *   post:
 *     summary: Update customer profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone_no:
 *                 type: string
 *               address:
 *                 type: string
 *               state:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *               password:
 *                 type: string
 *               business_name:
 *                 type: string
 *               business_state:
 *                 type: string
 *               business_city:
 *                 type: string
 *               business_zip_code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.post("updateprofile", verifyToken, async (req, res) => {
  const result = await userService.updateProfile(req.body);
  res.status(result.status).json(result);
});

/**
 * @swagger
 * /user/api/v1/addtocart:
 *   post:
 *     summary: Add product to cart
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - product_id
 *             properties:
 *               id:
 *                 type: string
 *               product_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product added to cart successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/addtocart", verifyToken, async (req, res) => {
  const result = await userService.addToCart(req.body);
  res.status(result.status).json(result);
});


/**
 * @swagger
 * /user/api/v1/currencieslist:
 *   get:
 *     summary: Get all currencies
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all currencies
 *       401:
 *         description: Unauthorized
 */
router.get("/currencieslist", async (req, res) => {
  const result = await userService.getCurrenciesList();
  res.status(result.status).json(result);
});

/**
 * @swagger
 * /user/api/v1/updatecurrency:
 *   post:
 *     summary: Update currency for a user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - currency_id
 *             properties:
 *               id:
 *                 type: string
 *               currency_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Currency updated successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/user/api/v1/updatecurrency", verifyToken, async (req, res) => {
  const result = await userService.updateCurrency(req.body);
  res.status(result.status).json(result);
});
/**
 * @swagger
 * /user/api/v1/update_email_account:
 *   post:
 *     summary: Update email account
 *     tags: [User]
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
 *               - uuid
 *               - first_name
 *               - last_name
 *               - email
 *             properties:
 *               domain_id:
 *                 type: string
 *               uuid:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email updated successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/update_email_account", verifyToken, async (req, res) => {
  const result = await userService.updateEmaliAccount(req.body);
  res.status(result.status).json(result);
});
/**
 * @swagger
 * /user/api/v1/delete_email_account:
 *   post:
 *     summary: Delete email account
 *     tags: [User]
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
 *               - uuid
 *             properties:
 *               domain_id:
 *                 type: string
 *               uuid:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/delete_email_account", verifyToken, async (req, res) => {
  const result = await userService.deleteEmaliAccount(req.body);
  res.status(result.status).json(result);
});

/**
 * @swagger
 * /user/api/v1/update_card:
 *   post:
 *     summary: Update customer profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: string
 *               card:
 *                 type: array
 *     responses:
 *       200:
 *         description: card updated successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/update_card", verifyToken, async (req, res) => {
  const result = await userService.updateCards(req.body);
  res.status(result.status).json(result);
});
/**
 * @swagger
 * /user/api/v1/card_list:
 *   post:
 *     summary: Get all card list
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: List of cards fetching successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/card_list", verifyToken, async (req, res) => {
  const result = await userService.getCustomerCards(req.body);
  res.status(result.status).json(result);
});
/**
 * @swagger
 * /user/api/v1/delete_card:
 *   post:
 *     summary: delete card
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - rec_id
 *             properties:
 *               user_id:
 *                 type: string
 *               rec_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: card deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/delete_card", verifyToken, async (req, res) => {
  const result = await userService.deleteCard(req.body);
  res.status(result.status).json(result);
});
/**
 * @swagger
 * /user/api/v1/make_defaulr_card:
 *   post:
 *     summary: make default card
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - rec_id
 *               - is_default
 *             properties:
 *               user_id:
 *                 type: string
 *               rec_id:
 *                 type: string
 *               is_default:
 *                 type: string
 *     responses:
 *       200:
 *         description: card make default successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/make_default_card", verifyToken, async (req, res) => {
  const result = await userService.makeDefaultCard(req.body);
  res.status(result.status).json(result);
});
module.exports = router;
