const express = require("express");
const router = express.Router();
const logindetails = require('../services/loginservice.js');
// Create new Admin credentials for login
router.post('/register', async (req, res) =>{
    const { email, password } = req.body;// Get the email and password from the request body
    res.status(200).send(await logindetails.register_new_admin({ email, password })); // Return the response in json format
})
// Admin login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;// Get the email and password from the request body
    res.status(200).send(await logindetails.login_admin({ email, password })); // Return response in json format
});

// Forget Password Link generation
router.post('/forgetpassword', async (req, res) => {
    const { email } = req.body;// Get the email from the request body
    res.status(200).send(await logindetails.generate_forget_password_link({ email })); // Return response in json format
});

module.exports = router;