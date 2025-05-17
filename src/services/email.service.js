const sgMail = require('@sendgrid/mail');
const dotenv = require("dotenv");

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Sent email verify
const sendVerificationEmail = async (toEmail, token) => {
  try {
    const verifyUrl = `${process.env.CLIENT_URL}/api/auth/verify-email?token=${token}`;

    const mailOptions = {
      from: "loverbee01@gmail.com",
      to: toEmail,
      subject: 'Verify your email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Hello!</h2>
          <p style="font-size: 16px; color: #555;">
            Thank you for registering an account on our system.
          </p>
          <p style="font-size: 16px; color: #555;">
            Please click the button below to verify your email and complete your registration:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a 
              href="${verifyUrl}" 
              style="background-color: #1a73e8; color: white; text-decoration: none; padding: 15px 30px; font-size: 18px; border-radius: 5px; display: inline-block;"
              target="_blank"
            >
              Verify now
            </a>
          </div>
          <p style="font-size: 14px; color: #999;">
            If you did not request this email, please ignore it.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #aaa; text-align: center;">
            Email sent from our system, do not reply to this email.
          </p>
        </div>
      `
    };

    await sgMail.send(mailOptions);
  } catch (error) {
    res.status(400).json({
      statusCode: 400,
      message: error || 'Error sending verification email',
    })
  }
};

// gui email reset password
const sendResetPasswordEmail = async (toEmail, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  const resetEmailTemplate = {
    from: "loverbee01@gmail.com",
    to: toEmail,
    subject: 'Password reset request',
    html: `
      <div style="max-width:600px; margin:0 auto; background:#fff; padding:30px; border-radius:8px; font-family: Arial, sans-serif; color:#333; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <h2 style="color:#2c3e50;">Password reset request</h2>
        <p style="font-size:16px; line-height:1.5;">
          You have just requested a password reset. Click the button below to do so:
        </p>
        <a href="${resetUrl}" target="_blank" rel="noopener noreferrer"
          style="display:inline-block; padding:12px 24px; background:#007bff; color:#fff; text-decoration:none; font-weight:600; border-radius:5px;">
          Reset Password
        </a>
        <p style="margin-top:20px; font-size:14px; color:#555;">
          If you did not request this, please ignore this email.
        </p>
        <p style="margin-top:20px; font-size:12px; color:#999;">
          This link will expire in 15 minutes.<br />
          If you can't click the button, you can copy the following link into your browser:<br />
          <a href="${resetUrl}" target="_blank" rel="noopener noreferrer" style="color:#007bff;">
            ${resetUrl}
          </a>
        </p>
      </div>
    `
  }
  
  await sgMail.send(resetEmailTemplate);
}

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail
};
