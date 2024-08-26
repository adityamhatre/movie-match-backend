import express from "express";
import {
  getTopRatedMovies,
  getTopRatedTvShows,
  getMovie,
  getTvShow,
} from "../tmdb-api.js";
import { addItemLike } from "../firebase-api.js";
var router = express.Router();

// get 10 movies
router.get("/movies/next", async (req, res, next) => {
  await getTopRatedMovies(req.query.page).then((movies) => {
    res.status(200).send(movies);
  });
});

// get 10 tv
router.get("/tv/next", async (req, res, next) => {
  await getTopRatedTvShows(req.query.page).then((tvShows) => {
    res.status(200).send(tvShows);
  });
});

// get 20 items, 10 tv 10 movies
router.get("/next", async (req, res, next) => {
  const page = req.query.page;
  const movies = getTopRatedMovies(page);
  const tvShows = getTopRatedTvShows(page);
  const result = await Promise.all([movies, tvShows]);
  res.status(200).send(result.flat());
});

router.post("/like", async (req, res, next) => {
  const user1 = req.body.likedBy;
  const user2 = req.body.otherUser;
  let result = await addItemLike(user1, user2, req.body.itemId);
  res.status(201).send(result);
});

router.get("/dislike/:type/:id", (req, res, next) => {
  res.status(200).send("Dislike");
});

export default router;
