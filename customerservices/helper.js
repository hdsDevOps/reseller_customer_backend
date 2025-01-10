//helper.js
const path = require("path");
const multer = require("multer");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");


const generateToken = (customer_id, email, expiresIn = "24h") => {
  const secretKey = process.env.CRYPTOTOKEN;

  if (!secretKey) {
    throw new Error("JWT secret key is not defined in environment variables");
  }

  return jwt.sign(
    {
      customer_id,
      email,
      type: "customer",
    },
    secretKey,
    { expiresIn: expiresIn }
  );
};

function getOffset(currentPage = 1, listPerPage) {
  return (currentPage - 1) * [listPerPage];
}

function emptyOrRows(rows) {
  if (!rows) {
    return [];
  }
  return rows;
}
// Define allowed file types
const filetypes = /jpeg|jpg|png|gif/;
let storage = (uploadPath) =>
  multer.diskStorage({
    destination: function (req, file, cb) {
      // Uploads is the Upload_folder_name
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  });

let file_upload = (uploadPath, fieldName) =>
  multer({
    storage: storage(uploadPath),
    fileFilter: function (req, file, cb) {
      var mimetype = filetypes.test(file.mimetype);

      var extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
      );

      if (mimetype && extname) {
        return cb(null, true);
      }

      cb(
        "File upload only supports the " + "following filetypes - " + filetypes
      );
    },
  }).single(fieldName);

async function sendmail(req, res, next) {
  var transporter = nodemailer.createTransport({
    host: process.env.SMTP,
    port: 587,
    auth: {
      user: process.env.MAILUSER,
      pass: process.env.MAILPASS,
    },
  });

  var mailOptions = {
    from: process.env.MAILUSER,
    to: req.email,
    subject: req.subject,
    html:req.body, // html body
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}
function getFirstLetters(str) {
  const firstLetters = str
    .split(" ")
    .map((word) => word.charAt(0))
    .join("");

  return firstLetters;
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPEmail(email, otp, subject = "", body = "") {
  if (subject == "") {
    subject = "Your OTP for Registration";
  }
  if (body == "") {
    body = `<p>Your OTP for registration is: <strong>${otp}</strong></p>
             <p>This OTP will expire in 10 minutes.</p>`;
  }
  const mailOptions = {
    from: process.env.MAILUSER,
    to: email,
    subject: subject,
    html: body,
  };

  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP,
      port: 587,
      auth: {
        user: process.env.MAILUSER,
        pass: process.env.MAILPASS,
      },
    });

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending OTP email:", error);
        reject(error);
      } else {
        console.log("OTP email sent:", info.response);
        resolve(info);
      }
    });
  });
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return { salt, hash };
}
function verifyPassword(password, salt, storedHash) {
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return storedHash === hash;
}

module.exports = {
  getOffset,
  emptyOrRows,
  file_upload,
  sendmail,
  getFirstLetters,
  generateOTP,
  sendOTPEmail,
  hashPassword,
  verifyPassword,
  generateToken,
};
