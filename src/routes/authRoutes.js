import express from "express";
import { getProfile, register, login, logout } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// router.use(authMiddleware)
router.get('/me', authMiddleware, getProfile)
router.post("/logout", authMiddleware, logout);

export default router;
