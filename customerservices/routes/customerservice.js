const admin = require('../firebaseConfig');

async function registerCustomer(data) {
  try {
    const userRecord = await admin.auth().createUser({
      email: data.email,
      password: data.password,
    });

    // Store additional customer data in Firestore
    await admin.firestore().collection('customers').doc(userRecord.uid).set({
      first_name: data.first_name,
      last_name: data.last_name,
      business_name: data.business_name,
      state: data.state,
      city: data.city,
      zipcode: data.zipcode,
      street_name: data.street_name,
      region: data.region,
      phone_no: data.phone_no,
    });

    // Generate and send OTP (you'll need to implement this part)
    const otp = generateOTP();
    await sendOTPEmail(data.email, otp);

    return { status: 200, message: 'Customer registered successfully. Please check your email for OTP.', userId: userRecord.uid };
  } catch (error) {
    return { status: 400, message: 'Error registering customer', error: error.message };
  }
}

async function verifyOTP(data) {
  try {
    // Implement OTP verification logic here
    const isValid = await validateOTP(data.customer_id, data.otp);
    if (isValid) {
      return { status: 200, message: 'OTP verified successfully' };
    } else {
      return { status: 400, message: 'Invalid OTP' };
    }
  } catch (error) {
    return { status: 400, message: 'Error verifying OTP', error: error.message };
  }
}

// Helper functions (to be implemented)
function generateOTP() {
  // Implement OTP generation logic
}

async function sendOTPEmail(email, otp) {
  // Implement email sending logic
}

async function validateOTP(customerId, otp) {
  // Implement OTP validation logic
}

module.exports = {
  registerCustomer,
  verifyOTP,
};