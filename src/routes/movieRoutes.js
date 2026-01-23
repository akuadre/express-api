import express from "express";
import {
  createMovie,
  deleteMovie,
  getDetailMovie,
  getMovies,
} from "../controllers/movieController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public access routes
router.get("/", getMovies);
router.get("/:id", getDetailMovie);

// Protected auth routes
router.use(authMiddleware);

router.post("/", createMovie);
router.delete("/:id", deleteMovie);

export default router;
