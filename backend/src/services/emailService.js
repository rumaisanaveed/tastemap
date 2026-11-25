const getResendClient = require("../config/resend");
const verificationEmail = require("../templates/verificationEmail");

const sendVerificationEmail = async ({ email, name, verificationUrl }) => {
    try {
        const resend = getResendClient();
        const emailContent = verificationEmail({
            name,
            verificationUrl
        });
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM,
            to: [email],
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text
        });
        if (error) {
            throw error;
        }
        return {
            success: true,
            emailId: data?.id
        };
    } catch (error) {
        console.error("Verification email sending failed:", error.message);
        throw new Error("Unable to send verification email");
    }
};

module.exports = {
    sendVerificationEmail
};
