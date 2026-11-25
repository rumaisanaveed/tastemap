const User = require("../models/User");
const VerificationToken = require("../models/VerificationToken");
const BlacklistedToken = require("../models/BlacklistedToken");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { hashToken: hashJwtToken } = require("../middleware/authMiddleware");

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password"
      });
    }

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration details"
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid registration details"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      isEmailVerified: false
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please log in."
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered"
      });
    }

    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid login details"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // if (!user.isEmailVerified) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Please verify your email before logging in.",
    //     code: "EMAIL_NOT_VERIFIED"
    //   });
    // }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Logout user
const logoutUser = async (req, res) => {
  try {
    await BlacklistedToken.create({
      tokenHash: hashJwtToken(req.token),
      expiresAt: new Date(req.user.exp * 1000)
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully."
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: "Logged out successfully."
      });
    }

    console.error("Logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser
};
