const { info } = require('console');
const crypto = require('crypto');
const { text } = require('express');
const nodemailer = require('nodemailer')

/**
 * Generates a random one-time password (OTP) as a string.
 *
 * @return {string} A random OTP between 10000 and 99999.
 */
function generateOTP() {
  return crypto.randomInt(10000, 99999).toString();
}

/**
 * Removes undefined properties from an object.
 *
 * @param {object} userData - The object to remove undefined properties from.
 * @return {object} A new object with undefined properties removed.
 */
function removeUndefinedProperties(userData) {
    return Object.fromEntries(Object.entries(userData).filter(([_, v]) => v !== undefined))
}


/**
 * Sends an email with a one-time password (OTP) to the specified user.
 *
 * @param {object} user - An object containing the user's email and OTP.
 * @return {string|null} "Success" if the email is sent successfully, null otherwise.
 */
async function sendEmail(user) {
    let transporter = nodemailer.createTransport({
        host: process.env.SMTP,
        port: 587,
        auth: {
            user: process.env.MAILUSER,
            pass: process.env.MAILPASS
        }
    });

    let mailOptions = {
        from: process.env.MAILUSER,
        to: user.email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${user.otp}.`
    }

    await transporter.sendMail(mailOptions, (error, info) => {
        if(error){
            return null
        }else{
            return("Success")
        }
        
    })
}


module.exports = { generateOTP, removeUndefinedProperties, sendEmail }