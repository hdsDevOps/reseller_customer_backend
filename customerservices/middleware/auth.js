const jwt = require("jsonwebtoken");

exports.verifyToken = async (req, res, next) => {

  const token =
    req.headers.authorization?.split("Bearer ")[1] || req.headers.token;

  if (!token) {
    return res.status(401).json({
      error: "No token provided",
      message: "Authentication token is required",
    });

  }

  try {
    const decodedToken = jwt.verify(token, process.env.CRYPTOTOKEN);

    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({status: 401, error: 'Invalid token' });

  }
};
