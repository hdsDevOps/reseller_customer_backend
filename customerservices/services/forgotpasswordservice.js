const bcrypt = require('bcrypt');
const { generateOTP, sendEmail } = require('../anotherhelper');
const { admin, db } = require('../dbconfig');

// Request Password Reset
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const userSnapshot = await db.collection('users').where('email', '==', email).get();

        if (userSnapshot.empty) {
            return res.status(400).json({ message: 'Email does not exist' });
        }

        const userDoc = userSnapshot.docs[0];
        const otp = generateOTP();
        await db.collection('users').doc(userDoc.id).update({
            otp: otp,
            otpCreatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const dataToSend = { otp, email };
        const emailResponse = await sendEmail(dataToSend);

        if (emailResponse == null) {
            return res.status(500).json({ message: 'Something went wrong. Unable to send OTP' });
        }

        if (emailResponse === 'Success') {
            return res.status(200).json({ message: `OTP has been sent to ${email}` });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Verify OTP
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const userSnapshot = await db.collection('users').where('email', '==', email).get();

        if (userSnapshot.empty) {
            return res.status(400).json({ message: 'Invalid email' });
        }

        const userDoc = userSnapshot.docs[0];

        if (userDoc.data().otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        const otpCreatedAt = userDoc.data().otpCreatedAt.toDate();
        const now = new Date();
        const otpExpiration = new Date(otpCreatedAt.getTime() + 10 * 60 * 1000);
        if (now > otpExpiration) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        await db.collection('users').doc(userDoc.id).update({
            otp: null,
            otpCreatedAt: null,
        });

        return res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Reset Password
const resetPassword = async (req, res) => {
    try {
        const { email, newPassword, confirmPassword } = req.body;

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const userSnapshot = await db.collection('users').where('email', '==', email).get();

        if (userSnapshot.empty) {
            return res.status(400).json({ message: 'Invalid email' });
        }

        const userDoc = userSnapshot.docs[0];
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        await db.collection('users').doc(userDoc.id).update({
            password: hashedPassword,
        });

        return res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    requestPasswordReset,
    verifyOtp,
    resetPassword
};