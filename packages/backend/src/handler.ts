import { Handler } from "aws-lambda";
import dayjs from "dayjs";
import express from "express";
import serverless from "serverless-http";

import { Session } from "@qify/api";

import { hasActiveDevices } from "./helpers/device";
import { updateQueue } from "./helpers/queue";
import { deleteSession, updateSessionTimeout } from "./helpers/session";
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
import { getItem } from "./services/db";
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
  const sessionId = String(event.session);

  const session = await getItem<Session>(sessionId);

  if (!session) {
    return "error no session";
  }

  const users = await sessionUsers(session.id);

  // Delete Machine if all Users left or session ran in the timeout
  if (users.length === 0 || dayjs().isAfter(session.timeout)) {
    await deleteSession(session, users);

    const arn = await stateMachineArn(session.id);

    if (!arn) {
      return "error no arn";
    }

    await deleteStateMachine(arn);

    return "delete success";
  }

  // Time in MS when the next Queue Lambda will be executed
  let time: number | undefined;

  const players = users.filter((user) => user.isPlayer);
  const sessionIsActive = await hasActiveDevices(players);

  // Increase timeout if there is atleast one active device
  if (sessionIsActive) {
    await updateSessionTimeout(
      session,
      dayjs().add(5, "minutes").toISOString()
    );
  }

  // Calculate the Machine Waiting Time by the Currentsong
  if (players.length) {
    const [player] = players;

    const { body } = await callSpotify(player, () =>
      spotify.getMyCurrentPlayingTrack()
    );

    time =
      body.item && body.progress_ms
        ? body.item.duration_ms - body.progress_ms
        : undefined;
  }

  await updateQueue(session.id, users);

  return await updateStateMachine(session.id, time);
};
