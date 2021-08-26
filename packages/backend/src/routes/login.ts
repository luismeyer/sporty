import { RequestHandler } from "express";

import { authorizeURL } from "../services/spotify";

export const redirectUri = "http://localhost:3000/authorize";

export const login: RequestHandler = (_req, res) => {
  const loginUrl = authorizeURL(
    "user-read-currently-playing",
    "user-modify-playback-state",
    "user-read-private",
    "user-read-playback-state"
  );

  res.json({
    loginUrl,
  });
};
