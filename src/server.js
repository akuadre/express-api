import express from "express";
import { config } from "dotenv";
// import { connectDB, disconnectDB } from "./config/db.js";

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import watchlistRoutes from "./routes/watchlistRoutes.js";
import testRoutes from "./routes/testRoutes.js";

import { errorMiddleware } from "./middleware/errorMiddleware.js";

import { requestLogger } from "./middleware/logger.js";
import { errorResponse } from "./utils/response.js";

config();

const app = express();

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);

// API Routes
app.use("/auth", authRoutes);
app.use("/movies", movieRoutes);
app.use("/watchlist", watchlistRoutes);

// Testing Routes
app.use("/test", testRoutes);

// const PORT = 3000;
const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.json({
    message: "Hello World",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on PORT: ${PORT}`);
});

// Catch all 404
app.use((req, res, next) => {
  errorResponse(res, `Route ${req.originalUrl} not found`, 404);
});

// Error middleware
app.use(errorMiddleware);
