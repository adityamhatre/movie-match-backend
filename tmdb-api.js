import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const baseURL = "https://api.themoviedb.org/3";
const apiKey = process.env.THE_MOVE_DB_ACCESS_TOKEN;
export const getTopRatedTvShows = async (page) => {
  page = page ?? 1;
  if (page <= 0) {
    page = 1;
  }
  const url = `${baseURL}/tv/top_rated`;
  return await send("tv", url, page);
};

export const getTopRatedMovies = async (page) => {
  page = page ?? 1;
  if (page <= 0) {
    page = 1;
  }
  const url = `${baseURL}/movie/top_rated`;
  return await send("movie", url, page);
};

export const getMovie = async (id) => {
  const url = `${baseURL}/movie/${id}`;
  return await send("movie", url);
};

export const getTvShow = async (id) => {
  const url = `${baseURL}/tv/${id}`;
  return await send("tv", url);
};

const send = async (type, url, page = 1) => {
  const response = await fetch(url + `?page=${page}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  });
  const data = await response.json();
  const dataArray = data.results ?? [data];
  return dataArray.map((d) => {
    return {
      id: `${type}/${d.id}`,
      title: d.name || d.title,
      posterPath: `https://image.tmdb.org/t/p/w500${d.poster_path}`,
    };
  });
};
