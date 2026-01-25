import { transporter } from "../config/mailer.js";

export const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"My App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export const sendOtpEmail = async (email, otp, purpose) => {
  const subjects = {
    REGISTER: "🔐 Verify Your Email",
    RESET_PASSWORD: "🔐 Reset Your Password",
  };

  const headers = {
    REGISTER: "Email Verification",
    RESET_PASSWORD: "Password Reset",
  };

  const mailOptions = {
    from: `"Movie App Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subjects[purpose],
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${headers[purpose]}</title>
</head>
<body style="
  margin:0;
  padding:0;
  background-color:#0b0b0c;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,Arial,sans-serif;
  color:#ffffff;
">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="
          background: linear-gradient(180deg, #111214 0%, #0b0b0c 100%);
          border-radius:16px;
          box-shadow:0 20px 40px rgba(0,0,0,0.6);
          overflow:hidden;
        ">

          <!-- Header -->
          <tr>
            <td style="
              padding:40px;
              text-align:center;
              border-bottom:1px solid #1f1f23;
            ">
              <h1 style="
                margin:0;
                font-size:26px;
                font-weight:600;
                letter-spacing:0.5px;
              ">
                ${headers[purpose]}
              </h1>
              <p style="
                margin-top:10px;
                font-size:14px;
                color:#9ca3af;
              ">
                Secure verification required
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              <p style="
                font-size:16px;
                line-height:1.6;
                color:#e5e7eb;
                margin-bottom:30px;
              ">
                You requested a one-time verification code.  
                Use the code below to continue:
              </p>

              <!-- OTP Box -->
              <div style="
                background: radial-gradient(circle at top, #1c1d21 0%, #121316 60%);
                border:1px solid #2a2b31;
                border-radius:14px;
                padding:30px;
                text-align:center;
                margin-bottom:30px;
              ">
                <div style="
                  font-size:12px;
                  text-transform:uppercase;
                  letter-spacing:2px;
                  color:#9ca3af;
                  margin-bottom:12px;
                ">
                  Your Verification Code
                </div>

                <div style="
                  font-size:42px;
                  font-weight:700;
                  letter-spacing:14px;
                  color:#ffffff;
                  font-family:'Courier New',monospace;
                ">
                  ${otp}
                </div>

                <div style="
                  margin-top:15px;
                  font-size:13px;
                  color:#9ca3af;
                ">
                  Expires in <strong style="color:#ffffff;">5 minutes</strong>
                </div>
              </div>

              <!-- Info -->
              <div style="
                background:#0f1013;
                border-left:4px solid #ffffff;
                padding:20px;
                border-radius:8px;
                margin-bottom:25px;
              ">
                <p style="margin:0;font-size:14px;color:#d1d5db;">
                  Open the app and enter this code to complete the process.
                </p>
              </div>

              <!-- Security Notice -->
              <p style="
                font-size:13px;
                color:#9ca3af;
                line-height:1.6;
              ">
                <strong style="color:#ffffff;">Security notice:</strong><br/>
                • Never share this code with anyone<br/>
                • Movie App will never ask for your OTP<br/>
                • If you didn’t request this, you can safely ignore this email
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              padding:30px;
              text-align:center;
              border-top:1px solid #1f1f23;
              font-size:12px;
              color:#6b7280;
            ">
              © ${new Date().getFullYear()} Movie App<br/>
              This is an automated security message
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

export const sendWelcomeEmail = async ({ email, name }) => {
  const mailOptions = {
    from: `"Movie App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🎬 Welcome to Movie App",
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome</title>
</head>
<body style="
  margin:0;
  padding:0;
  background-color:#0b0b0c;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,Arial,sans-serif;
  color:#ffffff;
">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="
          background: linear-gradient(180deg, #111214 0%, #0b0b0c 100%);
          border-radius:16px;
          box-shadow:0 20px 40px rgba(0,0,0,0.6);
          overflow:hidden;
        ">

          <!-- Header -->
          <tr>
            <td style="
              padding:40px;
              text-align:center;
              border-bottom:1px solid #1f1f23;
            ">
              <h1 style="
                margin:0;
                font-size:28px;
                font-weight:600;
              ">
                Welcome to Movie App
              </h1>
              <p style="
                margin-top:12px;
                font-size:14px;
                color:#9ca3af;
              ">
                Your account is ready
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              <p style="
                font-size:18px;
                margin-bottom:20px;
                color:#e5e7eb;
              ">
                Hi <strong style="color:#ffffff;">${name || "there"}</strong>,
              </p>

              <p style="
                font-size:15px;
                line-height:1.7;
                color:#d1d5db;
                margin-bottom:30px;
              ">
                Your email has been successfully verified.  
                Welcome to <strong style="color:#ffffff;">Movie App</strong> —  
                your personal space to track, explore, and organize movies you love.
              </p>

              <!-- Highlight box -->
              <div style="
                background:#0f1013;
                border-left:4px solid #ffffff;
                padding:24px;
                border-radius:10px;
                margin-bottom:30px;
              ">
                <p style="
                  margin:0;
                  font-size:14px;
                  color:#e5e7eb;
                ">
                  🎥 Start building your watchlist<br/>
                  ⭐ Rate and track watched movies<br/>
                  🗂 Keep everything organized in one place
                </p>
              </div>

              <p style="
                font-size:14px;
                color:#9ca3af;
                line-height:1.6;
              ">
                If you have any questions, feel free to explore the app or contact our support team.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              padding:30px;
              text-align:center;
              border-top:1px solid #1f1f23;
              font-size:12px;
              color:#6b7280;
            ">
              © ${new Date().getFullYear()} Movie App<br/>
              Built for movie lovers 🎬
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
