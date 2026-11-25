const User = require("../models/User");
const VerificationToken = require("../models/VerificationToken");

const jwt = require("jsonwebtoken");

const { generateToken, hashToken } = require("../utils/tokenUtils");
const { sendVerificationEmail } = require("../services/emailService");

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token || typeof token !== "string") {
            return res.status(400).json({
                success: false,
                message: "A valid verification token is required."
            });
        }

        const tokenHash = hashToken(token);

        const verificationToken = await VerificationToken.findOne({
            tokenHash,
            expiresAt: { $gt: new Date() }
        });

        if (!verificationToken) {
            return res.status(400).json({
                success: false,
                message: "Verification link is invalid or has expired."
            });
        }

        const user = await User.findByIdAndUpdate(
            verificationToken.userId,
            { isEmailVerified: true },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User account not found."
            });
        }

        const consumedToken = await VerificationToken.findOneAndDelete({
            _id: verificationToken._id,
            tokenHash,
            expiresAt: { $gt: new Date() }
        });

        if (!consumedToken) {
            return res.status(400).json({
                success: false,
                message: "This verification link has already been used or has expired."
            });
        }

        const authToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            success: true,
            message: "Email verified successfully.",
            token: authToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Email verification error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to verify email. Please try again."
        });
    }
};

const resendVerificationEmail = async (req, res) => {
    let newVerificationToken = null;
    let emailSent = false;

    try {
        const { email } = req.body;

        if (!email || typeof email !== "string" || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please provide your email address."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user || user.isEmailVerified) {
            return res.status(200).json({
                success: true,
                message: "If your account requires verification, a new email will be sent."
            });
        }

        const verificationToken = generateToken();

        newVerificationToken = await VerificationToken.create({
            userId: user._id,
            tokenHash: hashToken(verificationToken),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });

        const clientUrl = process.env.CLIENT_URL;

        if (!clientUrl) {
            throw new Error("CLIENT_URL is not configured");
        }

        const verificationUrl =
            `${clientUrl.replace(/\/$/, "")}/verify-email?token=${encodeURIComponent(verificationToken)}`;

        await sendVerificationEmail({
            email: user.email,
            name: user.name,
            verificationUrl
        });

        emailSent = true;

        await VerificationToken.deleteMany({
            userId: user._id,
            _id: { $ne: newVerificationToken._id }
        });

        return res.status(200).json({
            success: true,
            message: "If your account requires verification, a new email will be sent."
        });

    } catch (error) {
        if (newVerificationToken && !emailSent) {
            try {
                await VerificationToken.deleteOne({
                    _id: newVerificationToken._id
                });
            } catch (cleanupError) {
                console.error("Verification token cleanup error:", cleanupError);
            }
        }
        console.error("Resend verification error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to send verification email. Please try again."
        });
    }
};

module.exports = {
    verifyEmail,
    resendVerificationEmail
};
