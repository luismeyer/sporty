import { Handler } from "aws-lambda";
import express from "express";
import serverless from "serverless-http";

import { leave } from "./routes/leave";
import { login } from "./routes/login";
import { remove } from "./routes/remove";
import { add } from "./routes/add";
import { authorize } from "./routes/authorize";
import { create } from "./routes/create";
import { callSpotify, spotify } from "./services/spotify";
import {
  deleteStateMachine,
  stateMachineArn,
  updateStateMachine,
} from "./services/state-machine";
import { sessionUsers } from "./helpers/user";

const app = express();

app.use(express.json());

app.get("/login", login);
app.get("/authorize", authorize);

app.get("/create", create);
app.get("/leave", leave);

app.get("/add", add);
app.get("/remove", remove);

app.use((_req, res, _next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

export const handler = serverless(app);

export const queueFunction: Handler<{ session?: string }> = async (event) => {
  const session = String(event.session);

  if (!session) {
    return;
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
