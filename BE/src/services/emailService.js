const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

/**
 * Gửi email chứa mã OTP đặt lại mật khẩu
 * @param {string} toEmail
 * @param {string} otp - Mã 6 chữ số
 * @param {string} fullName
 */
const sendPasswordResetEmail = async (toEmail, otp, fullName) => {
  const displayName = fullName || 'bạn';

  const mailOptions = {
    from: `"AcadeLink" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Mã xác thực đặt lại mật khẩu AcadeLink',
    html: `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#f97316,#f59e0b);padding:32px 40px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">AcadeLink</h1>
                    <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Nền tảng học trực tuyến</p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:40px;">
                    <h2 style="margin:0 0 12px;color:#111827;font-size:20px;">Đặt lại mật khẩu</h2>
                    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
                      Xin chào <strong style="color:#111827;">${displayName}</strong>,<br/>
                      Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
                      Sử dụng mã xác thực bên dưới để tiến hành đặt lại mật khẩu.
                    </p>

                    <!-- OTP Box -->
                    <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 24px;">
                      <tr>
                        <td align="center">
                          <div style="background:#fff7ed;border:2px dashed #f97316;border-radius:12px;padding:24px 32px;display:inline-block;">
                            <p style="margin:0 0 6px;color:#9a3412;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Mã xác thực</p>
                            <p style="margin:0;color:#f97316;font-size:40px;font-weight:700;letter-spacing:10px;font-family:monospace;">${otp}</p>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;margin-bottom:24px;">
                      <p style="margin:0;color:#92400e;font-size:13px;">
                        ⏳ <strong>Lưu ý:</strong> Mã này chỉ có hiệu lực trong <strong>10 phút</strong>.
                        Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
                      </p>
                    </div>
                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 20px;" />
                    <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.5;">
                      Email này được gửi tự động từ hệ thống AcadeLink. Vui lòng không trả lời email này.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
                    <p style="margin:0;color:#9ca3af;font-size:12px;">© 2026 AcadeLink. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordResetEmail };
