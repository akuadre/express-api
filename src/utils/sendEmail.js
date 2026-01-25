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
    REGISTER: "Kode OTP Verifikasi Email",
    RESET_PASSWORD: "Kode OTP Change Password",
  };

  const headers = {
    REGISTER: "Verifikasi Email",
    RESET_PASSWORD: "Change Password",
  };

  const mailOptions = {
    from: `"Movie App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subjects[purpose],
    html: `
      <div style="font-family: Arial">
        <h2>${headers[purpose]}</h2>
        <p>Kode OTP kamu:</p>
        <h1 style="letter-spacing: 4px">${otp}</h1>
        <p>Kode ini berlaku selama <b>5 menit</b></p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};