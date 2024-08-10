const { info } = require('console');
const crypto = require('crypto');
const { text } = require('express');
const nodemailer = require('nodemailer')

function generateOTP() {
  return crypto.randomInt(10000, 99999).toString();
}

function removeUndefinedProperties(userData) {
    return Object.fromEntries(Object.entries(userData).filter(([_, v]) => v !== undefined))
}


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