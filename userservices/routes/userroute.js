const express = require("express");
const router = express.Router();
const userService = require("../services/userservice");
const { verifyToken } = require("../middleware/auth");
const multer = require('multer');
const path = require('path');
/**
 * @swagger
 * /user/api/v1/emaillist:
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
 *               - domain_id
 *             properties:
 *               id:
 *                 type: string
 *               domain_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: List of emails for the domain
 *       401:
 *         description: Unauthorized
 */
router.post("/emaillist", verifyToken, async (req, res) => {
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
 * /user/api/v1/changeemailstatus:
 *   post:
 *     summary: Change email status
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
 *               - email
 *               - status
 *             properties:
 *               domain_id:
 *                 type: string
 *               email:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email status change successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/changeemailstatus", verifyToken, async (req, res) => {
  const result = await userService.changeemailstatus(req.body);
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
 *                type: string
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
router.post("/updateprofile", verifyToken, async (req, res) => {
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
 * /user/api/v1/cartlist:
 *   post:
 *     summary: cart list
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
 *         description: Cart list fatched successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/cartlist", verifyToken, async (req, res) => {
  const result = await userService.cartList(req.body);
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
router.post("/updatecurrency", verifyToken, async (req, res) => {
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

// Configure Multer
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.png', '.jpeg', '.jpg'];

    if (!allowedExtensions.includes(fileExtension)) {
      return cb(
        new Error(`File upload only supports the following file types: ${allowedExtensions.join(', ')}`)
      );
    }
    cb(null, true);
  },
});

// Error-handling middleware for Multer
const uploadImageMiddleware = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof Error) {
      // If Multer or fileFilter throws an error, send a JSON response
      return res.status(400).send({status: "error",message:err.message});
    }
    next();
  });
};



router.post("/upload_profile_image", uploadImageMiddleware, userService.uploadimage);


/**
 * @swagger
 * /user/api/v1/get_customer_profile_data:
 *   post:
 *     summary: Get customer profile data
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
 *         description: customer profile data fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/get_customer_profile_data", verifyToken, async (req, res) => {
  const result = await userService.getCustomerProfileData(req.body);
  res.status(result.status).json(result);
});
/**
 * @swagger
 * /user/api/v1/get_notifications:
 *   post:
 *     summary: Get customer notification
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
 *               - page_no
 *             properties:
 *                user_id:
 *                 type: string
 *                page_no:
 *                 type: integer
 *     responses:
 *       200:
 *         description: customer notification fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/get_notifications", verifyToken, async (req, res) => {
  const result = await userService.getNotifications(req.body);
  res.status(result.status).json(result);
});


module.exports = router;
