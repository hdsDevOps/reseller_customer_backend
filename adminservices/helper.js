const path = require("path");
const multer = require("multer");
const nodemailer = require("nodemailer");
var request = require('request');
const urlencode = require("urlencode");

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
let storage = (uploadPath) => multer.diskStorage({
    destination: function (req, file, cb) {
  
        // Uploads is the Upload_folder_name
        cb(null, uploadPath)
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + "-" + Date.now()+path.extname(file.originalname))
    }
});
    
let file_upload = (uploadPath, fieldName) => multer({ 
    storage: storage(uploadPath),
    fileFilter: function (req, file, cb){
        var mimetype = filetypes.test(file.mimetype);
  
        var extname = filetypes.test(path.extname(
                    file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
      
        cb("File upload only supports the "
                + "following filetypes - " + filetypes);
      }
}).single(fieldName);


const transporter = nodemailer.createTransport({
  service: process.env.SMTP,
    port: 587,
    auth: {
      user: process.env.MAILUSER,
      pass: process.env.MAILPASS
    }
});

const sendMail = async (to, subject, text) => {
    const mailOptions = {
        from: process.env.MAILUSER,
        to,
        subject,
        text
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};
   function getFirstLetters(str) {
    const firstLetters = str
      .split(' ')
      .map(word => word.charAt(0))
      .join('');
  
    return firstLetters;
  }
module.exports = {
  getOffset,
  emptyOrRows,
  file_upload,
  sendMail,
  getFirstLetters
}