import { Handler } from "aws-lambda";
import express from "express";
import serverless from "serverless-http";

import { User } from "../../api/dist";
import { authorize } from "./authorize";
import { create } from "./create";
import { queryItems, sessionIndex } from "./db";
import { leave } from "./leave";
import { login } from "./login";
import { callSpotify, spotify } from "./spotify";
import {
  deleteStateMachine,
  stateMachineArn,
  updateStateMachine,
} from "./state-machine";

const app = express();

app.use(express.json());

app.get("/login", login);
app.get("/authorize", authorize);

app.get("/create", create);
app.get("/leave", leave);

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

  const sessionUsers = await queryItems<User>(sessionIndex, {
    expressionAttributeNames: { "#session": "session" },
    expressionAttributeValues: { ":session": session },
    keyConditionExpression: "#session = :session",
  });

  if (sessionUsers.length === 0) {
    const arn = await stateMachineArn(session);

    if (!arn) {
      return "error";
    }

    await deleteStateMachine(arn);

    return "success";
  }

  const sessionOwner = sessionUsers.find((user) => user.isOwner);

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
