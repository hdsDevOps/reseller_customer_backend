//services/customerservice.js
const { admin, db } = require("../firebaseConfig");
const {
  generateOTP,
  sendOTPEmail,
  hashPassword,
  verifyPassword,
  generateToken,
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
      password: data.password,
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
    await db
      .collection("customers")
      .doc(userRecord.uid)
      .update({
        otp: otp,
        otpExpiry: Date.now() + 10 * 60 * 1000, // 10 minutes
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


// async function verifyOTP(data) {
//   try {

//     if (!data.customer_id || !data.otp) {
//       return { status: 400, message: "Missing customer ID or OTP" };
//     }

//     const otpDoc = await db.collection("otps").doc(data.customer_id).get();
//     if (!otpDoc.exists) {
//       return { status: 400, message: "Invalid OTP or customer ID" };
//     }

//     const otpData = otpDoc.data();
//     const now = admin.firestore.Timestamp.now();
//     const otpCreationTime = otpData.createdAt;

//     // Check if OTP is expired (10 minutes validity)
//     if (now.seconds - otpCreationTime.seconds > 600) {
//       return { status: 400, message: "OTP has expired" };
//     }

//     if (otpData.otp === data.otp) {    
//       // Mark customer as verified
//       await db.collection("customers").doc(data.customer_id).update({
//         isVerified: true,
//         verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
//       });

//       // Delete the used OTP
//       await db.collection("otps").doc(data.customer_id).delete();

//       return { status: 200, message: "OTP verified successfully" };
//     } else {
//       return { status: 400, message: "Invalid OTP" };
//     }
//   } catch (error) {
//     console.error("Error in verifyOTP:", error);
//     return {
//       status: 500,
//       message: "Error verifying OTP",
//       error: error.message,
//     };
//   }
// }

async function verifyLoginOTP(data) {
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

    if (now.seconds - otpCreationTime.seconds > 6000) {
      return { status: 400, message: "OTP has expired" };
    }


    if (otpData.otp === data.otp) {
      await db.collection("otps").doc(data.customer_id).delete();
      const customToken = await admin.auth().createCustomToken(data.customer_id);


      const customerRef = db.collection('customers').doc(data.customer_id);
      const doc = await customerRef.get();
      const customerDoc = doc.data();
      const { passwordHash, ...customerData } = customerDoc;

      return { status: 200, message: "Login successful", token: customToken, customerData };
    } else {
      return { status: 400, message: "Invalid OTP" };
    }
  } catch (error) {
    console.error("Error in verifyLoginOTP:", error);
    return { status: 500, message: "Error verifying OTP", error: error.message };
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

    const isValidPassword = verifyPassword(
      data.password,
      customerData.salt,
      customerData.passwordHash
    );

    if (!isValidPassword) {
      return { status: 400, message: "Invalid email or password" };
    }

    const otp = generateOTP();
    console.log(otp);

    await db
      .collection("customers")
      .doc(customerId)
      .update({
        otp: otp,
        otpExpiry: Date.now() + 5 * 60 * 1000, // 5 minutes
      });

    // await sendOTPEmail(data.email, otp);

    return {
      status: 200,
      message: "Login successful. Please check your email for OTP.",
      customer_id: customerId,
      otp: otp
    };
  } catch (error) {
    console.error("Error in loginCustomer:", error);
    return { status: 500, message: "Error during login", error: error.message };
  }
}

async function verifyOTP(data) {
  try {
    if (!data.customer_id || !data.otp) {
      return { status: 400, message: "Missing customer ID or OTP" };
    }

    const customerDoc = await db
      .collection("customers")
      .doc(data.customer_id)
      .get();

    if (!customerDoc.exists) {
      return { status: 400, message: "Invalid OTP or customer ID" };
    }

    const { otp, otpExpiry, email } = customerDoc.data();

    // Check if the OTP has expired
    const currentTime = Date.now();
    if (currentTime > otpExpiry) {
      return { status: 400, message: "OTP has expired" };
    }

    if (otp === data.otp) {
      // generate JWT token
      const token = generateToken(data.customer_id, email);

      // Delete the used OTP
      await db.collection("customers").doc(data.customer_id).update({
        isVerified: true,
        otp: admin.firestore.FieldValue.delete(),
        otpExpiry: admin.firestore.FieldValue.delete(),
      });

      return {
        status: 200,
        message: "OTP verified successfully",
        token: token,
      };
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

async function requestPasswordReset(data) {
  try {
    if (!data.email) {
      return { status: 400, message: "Missing email" };
    }

    const customerDoc = await db
      .collection("customers")
      .where("email", "==", data.email)
      .limit(1)
      .get();

    if (customerDoc.empty) {
      return { status: 400, message: "Email not found" };
    }

    const customerId = customerDoc.docs[0].id;
    const otp = generateOTP();

    await db.collection("password_reset_otps").doc(customerId).set({
      otp: otp,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await sendOTPEmail(data.email, otp);
    console.log(otp);
    return { status: 200, message: "Password reset OTP sent to your email" };
  } catch (error) {
    console.error("Error in requestPasswordReset:", error);
    return {
      status: 500,
      message: "Error requesting password reset",
      error: error.message,
    };
  }
}

async function resendForgetPasswordOTP(data) {
  try {
    if (!data.email) {
      return { status: 400, message: "Missing email" };
    }

    const customerDoc = await db
      .collection("customers")
      .where("email", "==", data.email)
      .limit(1)
      .get();

    if (customerDoc.empty) {
      return { status: 400, message: "Email not found" };
    }

    const customerId = customerDoc.docs[0].id;
    const otp = generateOTP();

    await db.collection("password_reset_otps").doc(customerId).set({
      otp: otp,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await sendOTPEmail(data.email, otp);

    return {
      status: 200,
      message: "New password reset OTP sent to your email",
    };
  } catch (error) {
    console.error("Error in resendForgetPasswordOTP:", error);
    return {
      status: 500,
      message: "Error resending OTP",
      error: error.message,
    };
  }
}

async function verifyForgetPasswordOTP(data) {
  try {
    if (!data.email || !data.otp) {
      return { status: 400, message: "Missing email or OTP" };
    }

    const customerDoc = await db
      .collection("customers")
      .where("email", "==", data.email)
      .limit(1)
      .get();

    if (customerDoc.empty) {
      return { status: 400, message: "Email not found" };
    }

    const customerId = customerDoc.docs[0].id;
    const otpDoc = await db
      .collection("password_reset_otps")
      .doc(customerId)
      .get();

    if (!otpDoc.exists) {
      return { status: 400, message: "Invalid OTP" };
    }

    const otpData = otpDoc.data();
    const now = admin.firestore.Timestamp.now();
    const otpCreationTime = otpData.createdAt;

    if (now.seconds - otpCreationTime.seconds > 600) {
      return { status: 400, message: "OTP has expired" };
    }

    if (otpData.otp === data.otp) {
      await db.collection("password_reset_otps").doc(customerId).delete();
      return { status: 200, message: "OTP verified successfully" };
    } else {
      return { status: 400, message: "Invalid OTP" };
    }
  } catch (error) {
    console.error("Error in verifyForgetPasswordOTP:", error);
    return {
      status: 500,
      message: "Error verifying OTP",
      error: error.message,
    };
  }
}

async function resetPassword(data) {
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
      return { status: 400, message: "Email not found" };
    }

    const customerId = customerDoc.docs[0].id;
    const { salt, hash } = hashPassword(data.password);

    await db.collection("customers").doc(customerId).update({
      salt: salt,
      passwordHash: hash,
    });

    return { status: 200, message: "Password reset successfully" };
  } catch (error) {
    console.error("Error in resetPassword:", error);
    return {
      status: 500,
      message: "Error resetting password",
      error: error.message,
    };
  }
}

async function resendOTP(data) {
  try {
    // Validate input data  
    if (!data.customer_id) {
      return { status: 400, message: "Missing required fields" };
    }
    let query = db
      .collection("customers").doc(data.customer_id);
    const customer = await query.get();
    const customerdata = customer.data();

    // Check if email already exists
    const existingUser = await admin
      .auth()
      .getUserByEmail(customerdata.email)
      .catch(() => null);
    if (!existingUser) {
      return { status: 400, message: "No user found" };
    }
    const otp = generateOTP();
    await db
      .collection("customers")
      .doc(data.customer_id)
      .update({
        isVerified: false,
        otp: otp,
        otpExpiry: Date.now() + 10 * 60 * 1000, // 10 minutes
      });
    // Send OTP email
    await sendOTPEmail(customerdata.email, otp);

    return {
      status: 200,
      message:
        "Please check your email for OTP.",
      userId: data.customer_id,
    };
  } catch (error) {
    console.error("Error in OTP generation:", error);
    return {
      status: 500,
      message: "Error OTP generation",
      error: error.message,
    };
  }
}

module.exports = {
  registerCustomer,
  verifyOTP,
  loginCustomer,
  requestPasswordReset,
  resendForgetPasswordOTP,
  verifyForgetPasswordOTP,
  resetPassword,
  verifyLoginOTP,
  resendOTP
};