const { admin, db } = require("../firebaseConfig");
const {
  generateOTP,
  sendOTPEmail,
  hashPassword,
  verifyPassword,
} = require("../helper");

async function registerCustomer(data) {
  try {
    // Validate input data
    if (!data.email || !data.password || !data.first_name || !data.last_name) {
      return { status: 400, message: "Missing required fields" };
    }

    // Check if email already exists
    const existingUser = await admin
      .auth()
      .getUserByEmail(data.email)
      .catch(() => null);
    if (existingUser) {
      return { status: 400, message: "Email already in use" };
    }

    const { salt, hash } = hashPassword(data.password);
    const otp = generateOTP();

    const userRecord = await admin.auth().createUser({
      email: data.email,
      disabled: false,
    });

    // Store customer data in Firestore
    await db.collection("customers").doc(userRecord.uid).set({
      first_name: data.first_name,
      last_name: data.last_name,
      business_name: data.business_name,
      state: data.state,
      city: data.city,
      zipcode: data.zipcode,
      street_name: data.street_name,
      region: data.region,
      phone_no: data.phone_no,
      salt: salt,
      passwordHash: hash,
      email: data.email,
      isVerified: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Store OTP
    await db.collection("otps").doc(userRecord.uid).set({
      otp: otp,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send OTP email
    await sendOTPEmail(data.email, otp);

    return {
      status: 200,
      message:
        "Customer registered successfully. Please check your email for OTP.",
      userId: userRecord.uid,
    };
  } catch (error) {
    console.error("Error in registerCustomer:", error);
    return {
      status: 500,
      message: "Error registering customer",
      error: error.message,
    };
  }
}

async function verifyOTP(data) {
  try {
    if (!data.customer_id || !data.otp) {
      return { status: 400, message: "Missing customer ID or OTP" };
    }

    const otpDoc = await db.collection("otps").doc(data.customer_id).get();

    if (!otpDoc.exists) {
      return { status: 400, message: "Invalid OTP or customer ID" };
    }

    const otpData = otpDoc.data();
    const now = admin.firestore.Timestamp.now();
    const otpCreationTime = otpData.createdAt;

    // Check if OTP is expired (10 minutes validity)
    if (now.seconds - otpCreationTime.seconds > 600) {
      return { status: 400, message: "OTP has expired" };
    }

    if (otpData.otp === data.otp) {
      // Mark customer as verified
      await db.collection("customers").doc(data.customer_id).update({
        isVerified: true,
        verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Delete the used OTP
      await db.collection("otps").doc(data.customer_id).delete();

      return { status: 200, message: "OTP verified successfully" };
    } else {
      return { status: 400, message: "Invalid OTP" };
    }
  } catch (error) {
    console.error("Error in verifyOTP:", error);
    return {
      status: 500,
      message: "Error verifying OTP",
      error: error.message,
    };
  }
}

async function loginCustomer(data) {
  try {
    if (!data.email || !data.password) {
      return { status: 400, message: "Missing email or password" };
    }

    const customerDoc = await db
      .collection("customers")
      .where("email", "==", data.email)
      .limit(1)
      .get();

    if (customerDoc.empty) {
      return { status: 400, message: "Invalid email or password" };
    }

    const customerData = customerDoc.docs[0].data();
    const customerId = customerDoc.docs[0].id;

    if (!customerData.isVerified) {
      return {
        status: 400,
        message: "Account not verified. Please verify your email first.",
      };
    }

    const isValidPassword = verifyPassword(
      data.password,
      customerData.salt,
      customerData.passwordHash
    );

    if (isValidPassword) {
      // Generate a custom token for the user
      const customToken = await admin.auth().createCustomToken(customerId);
      return { status: 200, message: "Login successful", token: customToken };
    } else {
      return { status: 400, message: "Invalid email or password" };
    }
  } catch (error) {
    console.error("Error in loginCustomer:", error);
    return { status: 500, message: "Error during login", error: error.message };
  }
}

module.exports = {
  registerCustomer,
  verifyOTP,
  loginCustomer,
};
