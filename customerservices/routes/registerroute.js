const { Router } = require("express");
const { checkSchema } = require("express-validator");
const { createUserValidationSchema } = require("../schemas/registerSchema.js");
const router = Router();
const {
  register,
  verifyOtp,
  generateNewOtp,
} = require("../services/registerservice.js");

/**
 * @openapi
 * /customer/register:
 *  post:
 *      tags:
 *      - Customer Service
 *      summary: Register new users
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateUserInput'
 *      responses:
 *        201:
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/CreateUserCreatedResponse'
 *
 *        422:
 *          description: Unprocessable Entity
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/CreateUnprocessableError'
 *
 *        400:
 *          description: Bad Request
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/BadRequestError'
 *
 */
router
  .route("/register")
  .post(checkSchema(createUserValidationSchema), register);

/**
 * @openapi
 * /customer/verify-otp:
 *  post:
 *      tags:
 *      - Customer Service
 *      summary: Verify OTP
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateVerifyOtp'
 *      responses:
 *        200:
 *          description: Success
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/VerifyUserResponse'
 *
 *        400:
 *          description: Bad Request
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/BadRequestError'
 */
router.route("/verify-otp").post(verifyOtp);

/**
 * @openapi
 * /customer/generate-new-otp:
 *  post:
 *      tags:
 *      - Customer Service
 *      summary: Generate new OTP
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateNewOtp'
 *      responses:
 *        200:
 *          description: Success
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/NewOtpResponse'
 *
 *        400:
 *          description: Bad Request
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/BadRequestError'
 */
router.route("/generate-new-otp").post(generateNewOtp);

module.exports = router;
