const { admin } = require("../firebaseConfig");

exports.verifyToken = async (req, res, next) => {
  const token = req.headers.token;
  console.log(token)
  if (!token) {
    return res.status(401).json({status: 401, error: 'No token provided' });
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({status: 401, error: 'Invalid token' });
  }
};