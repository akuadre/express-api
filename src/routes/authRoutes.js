import express from "express";
import {
  getProfile,
  register,
  login,
  logout,
  sendEmailOtp,
  verifyEmailOtp,
  resetPassword,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);

router.post("/register/otp", sendEmailOtp("REGISTER"));
router.post("/reset-password/otp", sendEmailOtp("RESET_PASSWORD"));
router.post("/verify-otp", verifyEmailOtp);

router.post("/reset-password", resetPassword);
router.post("/login", login);

// router.use(authMiddleware)
router.get("/me", authMiddleware, getProfile);
router.post("/logout", authMiddleware, logout);

export default router;
