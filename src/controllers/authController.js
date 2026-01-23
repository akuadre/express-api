import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { successResponse, errorResponse } from "../utils/response.js";

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (userExists) {
    return errorResponse(res, "User already exists with this email", 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // Generate JWT
  const token = generateToken(user.id, res);

  const data = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    token,
  };

  return successResponse(res, "Create user success", data, 201);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return errorResponse(res, "Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return errorResponse(res, "Invalid email or password", 401);
  }

  // Generate JWT
  const token = generateToken(user.id, res);

  const data = {
    user: {
      id: user.id,
      name: user.name,
      email: email,
    },
    token,
  };

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

export { register, login, logout };
