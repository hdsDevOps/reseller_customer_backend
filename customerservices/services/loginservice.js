const admin = require('../firebaseConfig');
const axios = require('axios');
async function register_new_admin(data){
  let response_result = "";
    try {
        const userRecord = await admin.auth().createUser({
          email: data.email,
          password: data.password,
        });
        response_result = {status: 200, message: 'User created successfully', userId: userRecord.uid };
      } catch (error) {
        response_result = {status:400, message: 'Error creating user', error: error.message };
      }
      return response_result;
}

async function login_admin(data){
  let response_result = "";
  try {
    const { email, password } = data;
    const firebaseConfig = {
      apiKey: 'AIzaSyBDhOqLuQygzeZL-V1xqJkW37kpfiyHrgA',
    };

    const response = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`, {
      email,
      password,
      returnSecureToken: true,
    });

    const { idToken } = response.data;

    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
                    response_result = { status: 200,message: 'User login token generated', uid: decodedToken.uid };
  } catch (error) {
                    response_result = { error: error.message };
  }
  return response_result;
}

module.exports = {
    register_new_admin,
    login_admin
}