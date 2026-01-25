import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { successResponse, errorResponse } from "../utils/response.js";

import { generateOtp, hashOtp } from "../utils/otp.js";
import { sendOtpEmail, sendWelcomeEmail } from "../utils/sendEmail.js";
import { createHash, randomBytes } from "node:crypto";

const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return errorResponse(res, "Name, email, and password are required", 400);

  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists)
    return errorResponse(res, "User already exists with this email", 400);

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await prisma.user.create({
    data: { name, email, password: hashedPassword, emailVerified: false },
  });

  // Generate OTP for REGISTER
  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.emailOtp.create({
    data: { email, otpHash, purpose: "REGISTER", expiresAt },
  });

  await sendOtpEmail(email, otp, "REGISTER");

  return successResponse(
    res,
    "User created. OTP sent to email.",
    { email },
    201,
  );
};

export const sendEmailOtp = (purpose) => {
  return async (req, res) => {
    const { email } = req.body;

    if (!email) return errorResponse(res, "Email is required", 400);

    const allowedPurposes = ["REGISTER", "RESET_PASSWORD"];
    if (!allowedPurposes.includes(purpose))
      return errorResponse(
        res,
        "Purpose must be REGISTER or RESET_PASSWORD",
        400,
      );

    // ===== Cek kalau purpose REGISTER && user verified =====
    if (purpose === "REGISTER") {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user?.emailVerified) {
        return errorResponse(res, "Email already verified", 400);
      }
    }

    // check otp terbaru (throttle)
    const lastOtp = await prisma.emailOtp.findFirst({
      where: { email, purpose },
      orderBy: { createdAt: "desc" },
    });
    if (lastOtp && lastOtp.createdAt > new Date(Date.now() - 60 * 1000)) {
      return errorResponse(res, "Please wait before requesting a new OTP", 429);
    }

    // generate otp
    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

    try {
      // delete otp lama (check email + purpose)
      await prisma.emailOtp.deleteMany({
        where: { email, purpose },
      });

      // save otp
      await prisma.emailOtp.create({
        data: { email, otpHash, purpose, expiresAt },
      });

      // send email
      await sendOtpEmail(email, otp, purpose);

      console.log(`[OTP] Sent ${purpose} OTP to ${email}`);
      return successResponse(res, "OTP sent to email", { purpose }, 200);
    } catch (err) {
      console.error(err);
      return errorResponse(res, "Internal server error", 500);
    }
  };
};

export const verifyEmailOtp = async (req, res) => {
  const { email, otp, purpose } = req.body;

  if (!email || !otp)
    return errorResponse(res, "Email and OTP are required", 400);

  if (!purpose) return errorResponse(res, "Purpose is required", 400);

  const allowedPurposes = ["REGISTER", "RESET_PASSWORD"];
  if (!allowedPurposes.includes(purpose))
    return errorResponse(
      res,
      "Purpose must be REGISTER or RESET_PASSWORD",
      400,
    );

  const otpHash = hashOtp(otp);

  try {
    const record = await prisma.emailOtp.findFirst({
      where: { email, purpose },
    });

    if (!record) {
      console.log(
        `[OTP] Attempt failed: OTP not found for ${email}, purpose ${purpose}`,
      );
      return errorResponse(res, "OTP not found or already used", 400);
    }

    // cek expired
    if (record.expiresAt < new Date()) {
      await prisma.emailOtp.delete({ where: { id: record.id } });
      console.log(`[OTP] Expired attempt for ${email} purpose ${purpose}`);
      return errorResponse(res, "OTP expired", 400);
    }

    // cek otp
    if (record.otpHash !== otpHash) {
      console.log(`[OTP] Invalid attempt for ${email}, purpose ${purpose}`);
      return errorResponse(res, "Invalid OTP", 400);
    }

    // ===== OTP valid =====
    let responseData = { purpose };

    // update emailVerified & generate JWT kalau REGISTER
    if (purpose === "REGISTER") {
      const user = await prisma.user.update({
        where: { email },
        data: { emailVerified: true },
      });

      await sendWelcomeEmail({
        email: user.email,
        name: user.name,
      });

      // generate JWT
      const token = generateToken(user.id, res);
      responseData.token = token;
    }

    // ===== RESET PASSWORD =====
    if (purpose === "RESET_PASSWORD") {
      const rawToken = randomBytes(32).toString("hex");
      const tokenHash = createHash("sha256").update(rawToken).digest("hex");

      // invalidate token lama
      await prisma.passwordResetToken.deleteMany({
        where: { email },
      });

      await prisma.passwordResetToken.create({
        data: {
          email,
          tokenHash,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });

      responseData.resetToken = rawToken;
    }

    // sukses -> hapus otp
    await prisma.emailOtp.delete({ where: { id: record.id } });

    return successResponse(res, "OTP verified succesfully", responseData, 200);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Internal server error", 500);
  }
};

export const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  if (!resetToken || !newPassword) {
    return errorResponse(res, "Reset token and new password are required", 400);
  }

  const tokenHash = createHash("sha256").update(resetToken).digest("hex");

  try {
    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!record)
      return errorResponse(res, "Invalid or expired reset token", 400);

    if (record.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({
        where: { id: record.id },
      });
      return errorResponse(res, "Reset token expired", 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { email: record.email },
      data: { password: hashedPassword },
    });

    // token single-use
    await prisma.passwordResetToken.delete({
      where: { id: record.id },
    });

    return successResponse(
      res,
      "Password reset successfully. Please login again.",
      null,
      200,
    );
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Internal server error", 500);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return errorResponse(res, "Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return errorResponse(res, "Invalid email or password", 401);
  }

  const data = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
    },
  };

  // Kalau email belum verified → generate OTP baru
  if (!user.emailVerified) {
    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Hapus OTP lama dan simpan yang baru
    await prisma.emailOtp.deleteMany({ where: { email, purpose: "REGISTER" } });
    await prisma.emailOtp.create({
      data: { email, otpHash, purpose: "REGISTER", expiresAt },
    });

    await sendOtpEmail(email, otp, "REGISTER");

    // Kirim response tanpa token
    return successResponse(
      res,
      "Email not verified. OTP sent to email.",
      data,
      200,
    );
  }

  // Kalau email verified → generate JWT
  const token = generateToken(user.id, res);
  data.token = token;

  return successResponse(res, "Login success", data, 200);
};

const logout = async (req, res) => {
  // Ambil token dari cookie atau header
  let token =
    req.cookies?.jwt ||
    (req.headers.authorization?.startsWith("Bearer")
      ? req.headers.authorization.split(" ")[1]
      : null);

  // Validasi: jika token tidak ada
  if (!token) {
    return res.status(400).json({
      status: "fail",
      message: "No token provided, cannot logout",
    });
  }

  try {
    // Masukkan token ke tabel blocked
    await prisma.blockedToken.create({
      data: {
        token,
        userId: req.user.id,
      },
    });

    // Hapus cookie
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    return successResponse(res, "Logged out succesfully", 200);
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Something went wrong while logging out",
      error: err.message,
    });
  }
};

const getProfile = async (req, res) => {
  const user = req.user;

  return successResponse(
    res,
    "User profile fetched successfully",
    {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    200,
  );
};

export { getProfile, register, login, logout };
