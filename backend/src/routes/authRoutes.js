const express = require("express");
const router = express.Router();

const { registerUser, loginUser, getCurrentUser, logoutUser } = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");
const { verificationLimiter, resendVerificationLimiter } = require("../middleware/rateLimitMiddleware");
const { verifyEmail, resendVerificationEmail } = require("../controllers/verificationEmailController");

router.post("/register", registerUser);
router.post("/login", loginUser);

// Email verification
// router.post("/verify-email", verificationLimiter, verifyEmail);
// router.post("/resend-verification", resendVerificationLimiter, resendVerificationEmail);

router.get("/get-current-user", protect, getCurrentUser);
router.post("/logout", protect, logoutUser);

module.exports = router;
