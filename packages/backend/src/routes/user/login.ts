import { RequestHandler } from 'express';

import { LoginResponse } from '@sporty/api';

import { authorizeURL } from '../../services/spotify';

export const redirectUri = "http://localhost:3000/authorize";

export const loginUser: RequestHandler<unknown, LoginResponse> = (
  _req,
  res
) => {
  const loginUrl = authorizeURL(
    "user-read-currently-playing",
    "user-modify-playback-state",
    "user-read-private",
    "user-read-playback-state",
    "user-read-recently-played",
    "user-top-read"
  );

  res.json({
    success: true,
    body: {
      url: loginUrl,
    },
  });
};
