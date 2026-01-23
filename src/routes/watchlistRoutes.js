import express from "express";
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from "../controllers/watchlistController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

import { addToWatchlistSchema } from "../validators/watchlistValidators.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getWatchlist);
router.post("/", validateRequest(addToWatchlistSchema), addToWatchlist);
router.delete("/:id", removeFromWatchlist);

export default router;
