import { Handler } from "aws-lambda";
import express from "express";
import serverless from "serverless-http";

import { updateQueue } from "./helpers/queue";
import { sessionUsers } from "./helpers/user";
import { addSong } from "./routes/queue/add";
import { getQueue } from "./routes/queue/get";
import { removeSong } from "./routes/queue/remove";
import { search } from "./routes/search";
import { createSession } from "./routes/session/create";
import { getSession } from "./routes/session/get";
import { joinSession } from "./routes/session/join";
import { leaveSession } from "./routes/session/leave";
import { authorizeUser } from "./routes/user/authorize";
import { getUser } from "./routes/user/get";
import { loginUser } from "./routes/user/login";
import { toggleIsPlayer } from "./routes/user/player";
import { callSpotify, spotify } from "./services/spotify";
import {
  deleteStateMachine,
  stateMachineArn,
  updateStateMachine,
} from "./services/state-machine";

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

app.get(`${baseUrl}/search`, search);

app.use((_req, res, _next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

export const handler = serverless(app);

export const queueFunction: Handler<{ session?: string }> = async (event) => {
  const session = String(event.session);

  if (!session) {
    return "error";
  }

  const users = await sessionUsers(session);

  if (users.length === 0) {
    const arn = await stateMachineArn(session);

    if (!arn) {
      return "error";
    }

    await deleteStateMachine(arn);

    return "success";
  }

  const sessionOwner = users.find((user) => user.isOwner);

  if (!sessionOwner) {
    return "No session owner";
  }

  await updateQueue(session);

  const { body } = await callSpotify(sessionOwner, () =>
    spotify.getMyCurrentPlayingTrack()
  );

  return await updateStateMachine(
    session,
    body.item && body.progress_ms
      ? body.item.duration_ms - body.progress_ms
      : 10000
  );
};
