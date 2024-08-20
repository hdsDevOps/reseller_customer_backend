const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const {
  generateOTP,
  removeUndefinedProperties,
  sendEmail,
} = require("../anotherhelper");
const { admin, db } = require("../dbconfig");


/**
 * Handles user registration, including validation, password hashing, OTP generation, 
 * and user creation in the database. It also sends a verification email to the user.
 *
 * @param {object} req - Express request object containing user registration data
 * @param {object} res - Express response object
 * @return {Promise<void>} 
 */
const register = async (req, res) => {
  try {
    const result = validationResult(req);
    if(!result.isEmpty()) return res.status(422).json({ errors: result.array() });

    const {
      firstName,
      lastName,
      businessName,
      streetAddress,
      state,
      region,
      city,
      zipCode,
      email,
      phoneNumber,
      password,
    } = req.body;

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, saltRounds)

    // console.log({
    //   firstName,
    //   lastName,
    //   email,
    //   password: hashedPassword,
    //   phoneNumber,
    //   businessName,
    //   streetAddress,
    //   state,
    //   region,
    //   city,
    //   zipCode,
    //   otp,
    //   isVerified: false,
    //   isDisabled: false,
    //   createdAt: String(Date(admin.firestore.FieldValue.serverTimestamp())),
    //   updatedAt: String(Date(admin.firestore.FieldValue.serverTimestamp())),
    // });
    const user = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber,
      businessName,
      streetAddress,
      state,
      region,
      city,
      zipCode,
      otp: hashedOtp,
      otpCreatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isVerified: false,
      isDisabled: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    const userSnapshot = await db.collection("users").where("email", "==", user.email).get();
    if(!userSnapshot.empty) return res.status(400).json({ message: "Email already registered" });

    const filteredUserObj = removeUndefinedProperties(user);
    // const emailResponse = await sendEmail(user);

    // if (emailResponse == null) return res.status(400).json({message: "Something went wrong. Unable to complete registration",});
    // }
    // if (emailResponse === "Success") {}
      const savedUser = await db.collection("users").add(filteredUserObj);
      const savedUserDoc = await savedUser.get();

      if(!savedUserDoc.exists) return res.status(400).json({message: "User document not found after creation"});

      const savedUserObj = savedUserDoc.data();
      res.status(201).json(
          {
            message: "User created successfully",
            id: savedUser.id,
            email: savedUserObj.email,
            isVerified: savedUserObj.isVerified
          },
        );
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

/**
 * Verifies a user's one-time password (OTP) and updates their account verification status.
 *
 * @param {object} req - The HTTP request object.
 * @param {string} req.body.email - The user's email address.
 * @param {string} req.body.otp - The one-time password to verify.
 * @param {object} res - The HTTP response object.
 * @return {object} A JSON response with a success or error message.
 */
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const userSnapshot = await db.collection("users").where("email", "==", email).get();
    if(userSnapshot.empty) return res.status(400).json({ message: "Invalid email" });
    const userDoc = userSnapshot.docs[0];
    const userRef = userDoc.data()

    if(userRef.isVerified !== false) return res.status(400).json({ message: "User is verified" });

    const isMatch = await bcrypt.compare(otp, userRef.otp)

    if(!isMatch) return res.status(400).json({ message: "Invalid OTP" });

    const otpCreatedAt = userRef.otpCreatedAt.toDate();
    const now = new Date();
    const otpExpiration = new Date(otpCreatedAt.getTime() + 10 * 60 * 1000);
    if(now > otpExpiration) return res.status(400).json({ message: "OTP expired" });
    await db.collection("users").doc(userDoc.id).update({
      isVerified: true,
      otp: null,
      otpCreatedAt: null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  
    res.status(200).json({ message: "Account verified successfully", id: userDoc.id});
    
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Generates a new one-time password (OTP) for a user and sends it to their email address.
 *
 * @param {object} req - Express request object containing the user's email address in the request body.
 * @param {object} res - Express response object used to send the response back to the client.
 * @return {Promise<void>} 
 */
const generateNewOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const userSnapshot = await db.collection("users").where("email", "==", email).get();
    let saltRounds = 12

    if(userSnapshot.empty) return res.status(400).json({ message: "Incorrect email" });

    const userDoc = userSnapshot.docs[0];
    const userRef = userDoc.data();

    if(userRef.isVerified !== false) return res.status(400).json({ message: "Account already verified" });
    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, saltRounds);
    console.log(otp);
    
    await db.collection("users").doc(userDoc.id).update({
      otp: hashedOtp,
      otpCreatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // const dataToSend = {
    //   otp,
    //   email,
    // };
    // const emailResponse = await sendEmail(dataToSend);
    // if(emailResponse == null) return res.status(400).json({message: "Something went wrong. Unable to complete registration"});
    // if (emailResponse === "Success") {}
    res.status(200).json({ message: `Otp has been sent to ${email}` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  register,
  verifyOtp,
  generateNewOtp,
};
