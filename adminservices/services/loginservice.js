const {admin,db} = require('../firebaseConfig');
const axios = require('axios');
var CryptoJS = require("crypto-js");
const helper = require('../helper');
//This services will call the firebase register API
async function register_new_admin(data){
  let response_result = "";
    try {
        const userRecord = await admin.auth().createUser({
          email: data.email,
          password: data.password,
        });
        await db.collection('users').add(data);

        response_result = {status: 200, message: 'User created successfully', userId: userRecord.uid };
      } catch (error) {
        response_result = {status:400, message: 'Error creating user test', error: error.message };
      }
      return response_result;
}
// This services will call the firebase login API
async function login_admin(data){
  let response_result = "";
  try {
    const { email, password } = data;
    const firebaseConfig = {
      apiKey: process.env.APITOKEN, // Use APIKEY from .env file
    };

    const response = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`, {
      email,
      password,
      returnSecureToken: true,
    });

    const { idToken } = response.data;
    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    let otp = Math.floor(100000 + Math.random() * 900000);
    const login_otp = CryptoJS.AES.encrypt(""+otp+"", process.env.CRYPTOTOKEN).toString();
    
                    response_result = { status: 200,message: 'User login token generated', uid: decodedToken.uid, login_otp: login_otp };
  } catch (error) {
                    response_result = { status: 400, message: 'Error logging in user', error: error.message };
  }
  return response_result;
}
///////////// Genrate Forget Password Link using Firebase //////////////
async function generate_forget_password_link(data){
  let response_result = "";
    try {
      const { email } = data;
      const user = await admin.auth().getUserByEmail(email);
      const link = await admin.auth().generatePasswordResetLink(email);

        response_result = {status: 200, message: 'Password reset link for send to user email address.', link: link };
        helper.sendMail(email, 'Password Reset Link', link);
      } catch (error) {
        response_result = {status:400, message: 'Error creating user', error: error.message };
      }
      return response_result;
}

module.exports = {
    register_new_admin,
    login_admin,
    generate_forget_password_link
}