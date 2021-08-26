import { RequestHandler } from 'express';

import { User } from '@qify/api';

import { sessionUsers } from '../helpers/user';
import { getItem, updateItem } from '../services/db';
import { callSpotify, spotify } from '../services/spotify';

type Query = {
  id?: string;
  songId?: string;
  force?: boolean;
};

export const add: RequestHandler<any, any, any, Query> = async (req, res) => {
  const { id, songId, force } = req.query;

  if (!id) {
    return res.json({
      error: "Missing id",
    });
  }

  if (!songId) {
    return res.json({
      error: "Missing songId",
    });
  }

  const user = await getItem<User>(id);

  if (!user) {
    return res.json({
      error: "Can't find user",
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
  await updateItem(id, {
    expressionAttributeNames: { "#queue": "queue" },
    expressionAttributeValues: { ":queue": [...user.queue, songId] },
    updateExpression: "SET #queue = :queue",
  });

  res.json({
    message: "Success",
  });
};
