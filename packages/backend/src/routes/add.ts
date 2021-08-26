import { RequestHandler } from "express";

import { authorizeRequest, sessionUsers } from "../helpers/user";
import { updateItem } from "../services/db";
import { callSpotify, spotify } from "../services/spotify";

type Query = {
  songId?: string;
  force?: boolean;
};

export const add: RequestHandler<unknown, unknown, unknown, Query> = async (
  req,
  res
) => {
  const { songId, force } = req.query;

  if (!songId) {
    return res.json({
      error: "Missing songId",
    });
  }

  const user = await authorizeRequest(req.headers);

  if (!user) {
    return res.json({
      error: "Wrong token",
    });
  }

  // Fetch all Queues from other users in the session
  const queues = user.session
    ? await sessionUsers(user.session).then((res) =>
        res.reduce<string[]>((acc, user) => [...acc, ...user.queue], [])
      )
    : [];

  // Return if song is in Queue and force is disabled
  if ([...queues, user.queue].includes(songId) && !force) {
    return res.json({
      error: "Song already in Queue",
    });
  }

  // Validate that the Song Id is correct
  const track = await callSpotify(user, () => spotify.getTrack(songId)).catch(
    () => undefined
  );

  if (!track) {
    return res.json({
      error: "Wrong song id",
    });
  }

  // Append Item
  await updateItem(user.id, {
    expressionAttributeNames: { "#queue": "queue" },
    expressionAttributeValues: { ":queue": [...user.queue, songId] },
    updateExpression: "SET #queue = :queue",
  });

  res.json({
    message: "Success",
  });
};
