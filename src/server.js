import express from "express";
import { config } from "dotenv";
// import { connectDB, disconnectDB } from "./config/db.js";

// Import Routes
import movieRoutes from "./routes/movieRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import watchlistRoutes from "./routes/watchlistRoutes.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";

import { requestLogger } from "./middleware/logger.js";
import { errorResponse } from "./utils/response.js";

config();
// connectDB();

const app = express();

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);

// API Routes
app.use("/movies", movieRoutes);
app.use("/auth", authRoutes);
app.use("/watchlist", watchlistRoutes);

// const PORT = 3000;
const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.json({
    message: "Hello World",
  });
});

// app.listen(PORT, () => {
//   console.log(`Server running on PORT: ${PORT}`);
// });

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on PORT: ${PORT}`);
});

// process.on("unhandledRejection", (err) => {
//   console.error("Unhandled Rejection:", err);
//   server.close(async () => {
//     await disconnectDB();
//     process.exit(1);
//   });
// });

// process.on("uncaughtRejection", async (err) => {
//   console.error("Uncaught Rejection:", err);
//   await disconnectDB();
//   process.exit(1);
// });

// process.on("unhandledRejection", (err) => {
//   console.error("Unhandled Rejection:", err);
//   server.close(async () => {
//     await disconnectDB();
//     process.exit(1);
//   });
// });

// Catch all 404
app.use((req, res, next) => {
  // res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
  errorResponse(res, `Route ${req.originalUrl} not found`, 404)
});

// Error middleware
app.use(errorMiddleware);
