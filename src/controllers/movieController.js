import { prisma } from "../config/db.js";
import { errorResponse, successResponse } from "../utils/response.js";

const getMovies = async (req, res) => {
  const movies = await prisma.movie.findMany({
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      },
    },
  });
  const data = { movies };

  return successResponse(res, "Success get movies", data, 200);
};

const getDetailMovie = async (req, res) => {
  const movieId = req.params.id;

  const movieData = await prisma.movie.findUnique({
    where: { id: movieId },
  });

  if (!movieData) {
    return errorResponse(res, "Movie not found", data, 404);
  }

  const data = { movie: movieData };

  return successResponse(res, "Success get detail movie", data, 200);
};

const createMovie = async (req, res) => {
  try {
    const { title, overview, releaseYear, genres, runtime, posterUrl } =
      req.body;

    if (!title || !releaseYear) {
      return errorResponse(res, "title and releaseYear must be inputed", 400);
    }

    const creator = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!creator) {
      return errorResponse(res, "Creator not found", 404);
    }

    const movieData = await prisma.movie.create({
      data: {
        title,
        overview,
        releaseYear,
        genres: genres || [],
        runtime,
        posterUrl,
        createdBy: req.user.id,
      },

      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const data = { movie: movieData };

    return successResponse(res, "Success create movie", data, 201);
  } catch (err) {
    console.error("Create movie error:", err);
    return errorResponse(res, "Internal server error", 500);
  }
};

const deleteMovie = async (req, res) => {
  try {
    const movieId = req.params.id;

    const movieData = await prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movieData) {
      return errorResponse(res, "Movie not found", 404);
    }

    // Ensure only owner can delete
    if (movieData.createdBy !== req.user.id) {
      return errorResponse(res, "Not allowed to delete this movie", 403);
    }

    await prisma.movie.delete({
      where: { id: movieId },
    });

    return successResponse(res, "Success delete movie", null, 200);
  } catch (err) {
    console.error("Create movie error:", err);
    return errorResponse(res, "Internal server error", 500);
  }
};

export { getMovies, getDetailMovie, createMovie, deleteMovie };
