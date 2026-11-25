const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const BlacklistedToken = require("../models/BlacklistedToken");
const User = require("../models/User");

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please log in."
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const isBlacklisted = await BlacklistedToken.exists({
      tokenHash: hashToken(token)
    });

    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: "User has been logged out. Please log in again."
      });
    }

    const user = await User.findById(decoded.id).select("isEmailVerified");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found. Please log in again."
      });
    }

    // if (!user.isEmailVerified) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Please verify your email first.",
    //     code: "EMAIL_NOT_VERIFIED"
    //   });
    // }

    req.user = {
      id: decoded.id,
      exp: decoded.exp
    };

    req.token = token;

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token."
    });
  }
};

module.exports = protect;
module.exports.hashToken = hashToken;
