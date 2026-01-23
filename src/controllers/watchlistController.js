import { prisma } from "../config/db.js";
import { successResponse, errorResponse } from "../utils/response.js";

const getWatchlist = async (req, res) => {
  const userId = req.user.id;

  const watchlistItems = await prisma.watchlistItem.findMany({
    where: { userId },
    include: {
      movie: true,
    },
  });

  // if (watchlistItems.length === 0) {
  //   return successResponse(res, "Watchlist is still empty", [], 200);
  // }

  return successResponse(
    res,
    "Success get user watchlist",
    watchlistItems,
    200,
  );
};

const addToWatchlist = async (req, res) => {
  const { movieId, status, rating, notes } = req.body;

  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
  });

  if (!movie) {
    return errorResponse(res, "Movie not found", 404);
  }
  const existingInWatchlist = await prisma.watchlistItem.findUnique({
    where: {
      userId_movieId: {
        userId: req.user.id,
        movieId: movieId,
      },
    },
  });

  if (existingInWatchlist) {
    return errorResponse(res, "Movie already in the watchlist", 400);
  }

  const watchlistItem = await prisma.watchlistItem.create({
    data: {
      userId: req.user.id,
      movieId,
      status: status || "PLANNED",
      rating,
      notes,
    },
  });

  return successResponse(
    res,
    "Success add movie to watchlist",
    watchlistItem,
    200,
  );
};

const removeFromWatchlist = async (req, res) => {
  const watchlistItem = await prisma.watchlistItem.findUnique({
    where: { id: req.params.id },
  });

  if (!watchlistItem) {
    return errorResponse(res, "Watchlist item not found", 404);
  }

  // Ensure only owner can delete
  if (watchlistItem.userId !== req.user.id) {
    return errorResponse(res, "Not allowed to update this watchlist item", 403);
  }

  await prisma.watchlistItem.delete({
    where: { id: req.params.id },
  });

  return successResponse(
    res,
    "Movie removed from watchlist",
    watchlistItem,
    200,
  );
};

export { getWatchlist, addToWatchlist, removeFromWatchlist };
