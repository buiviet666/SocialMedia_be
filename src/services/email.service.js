const nodemailer = require('nodemailer');

// Khởi tạo transporter với Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,      // Email gửi
    pass: process.env.EMAIL_PASSWORD,  // Mật khẩu ứng dụng (app password)
  },
});

// Gửi email xác thực
const sendVerificationEmail = async (toEmail, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/api/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: `"Mạng Xã Hội" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Xác thực email của bạn',
    html: `
      <h3>Xác thực tài khoản</h3>
      <p>Vui lòng bấm vào link bên dưới để xác thực email:</p>
      <a href="${verifyUrl}">Xác thực ngay</a>
      <p>Link này sẽ hết hạn sau 1 giờ.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

// gui email reset password
const sendResetPasswordEmail = async (toEmail, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  const resetEmailTemplate = {
    from: `"Support" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Yêu cầu đặt lại mật khẩu',
    html: `
      <h3>Đặt lại mật khẩu</h3>
      <p>Bạn vừa yêu cầu đặt lại mật khẩu. Nhấn vào link bên dưới để thực hiện:</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p>Link này sẽ hết hạn sau 15 phút.</p>
    `
  }
  
  await transporter.sendMail(resetEmailTemplate);
}

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail
};
