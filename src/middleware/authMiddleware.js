import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";
import { errorResponse, successResponse } from "../utils/response.js";

export const authMiddleware = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]; // ["Bearer", "xxxxtoken"]
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({
      error: "Not authorized, no token provided",
    });
  }

  try {
    // Cek apakah token diblokir
    const blocked = await prisma.blockedToken.findUnique({
      where: { token },
    });

    if (blocked) {
      return errorResponse(res, 'Token has been blocked (logout)', 401)
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({
        error: "User no longer exists",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      error: "Not authorized, token failed",
      message: err.message,
    });
  }
};
