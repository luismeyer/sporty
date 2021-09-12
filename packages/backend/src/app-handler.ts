import express from 'express';
import serverless from 'serverless-http';

import { getPlayer } from './routes/player/get';
import { nextPlayer } from './routes/player/next';
import { pausePlayer } from './routes/player/pause';
import { startPlayer } from './routes/player/start';
import { addSong } from './routes/queue/add';
import { getQueue } from './routes/queue/get';
import { removeSong } from './routes/queue/remove';
import { search } from './routes/search';
import { createSession } from './routes/session/create';
import { getSession } from './routes/session/get';
import { joinSession } from './routes/session/join';
import { leaveSession } from './routes/session/leave';
import { authorizeUser } from './routes/user/authorize';
import { getUser } from './routes/user/get';
import { loginUser } from './routes/user/login';
import { toggleIsPlayer } from './routes/user/player';

const app = express();
const baseUrl = "/api";

app.use(express.json());

app.get(`${baseUrl}/user`, getUser);
app.get(`${baseUrl}/user/player`, toggleIsPlayer);
app.get(`${baseUrl}/user/login`, loginUser);
app.get(`${baseUrl}/user/authorize`, authorizeUser);

app.get(`${baseUrl}/session`, getSession);
app.get(`${baseUrl}/session/join`, joinSession);
app.get(`${baseUrl}/session/create`, createSession);
app.get(`${baseUrl}/session/leave`, leaveSession);

app.get(`${baseUrl}/queue`, getQueue);
app.get(`${baseUrl}/queue/add`, addSong);
app.get(`${baseUrl}/queue/remove`, removeSong);

app.get(`${baseUrl}/player`, getPlayer);
app.get(`${baseUrl}/player/start`, startPlayer);
app.get(`${baseUrl}/player/pause`, pausePlayer);
app.get(`${baseUrl}/player/next`, nextPlayer);

app.get(`${baseUrl}/search`, search);

app.use((_req, res, _next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

export const handler = serverless(app);
