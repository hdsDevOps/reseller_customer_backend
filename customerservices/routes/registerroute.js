const { Router } = require("express")
const { checkSchema } = require('express-validator')
const { createUserValidationSchema} = require('../validationScema.js')
const router = Router()
const { register, verifyOtp, generateNewOtp } = require('../services/registerservice.js')


router.route('/register')
.post(checkSchema(createUserValidationSchema), register)

router.route('/verify-otp')
.post(verifyOtp)


router.route('/generate-new-otp')
.post(generateNewOtp)

module.exports = router