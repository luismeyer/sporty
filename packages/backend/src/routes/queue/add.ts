import { RequestHandler } from "express";
import { QueueResponse } from "../../../../api/dist";

import { generateQueue, transformQueue } from "../../helpers/queue";
import { authorizeRequest, sessionUsers } from "../../helpers/user";
import { updateItem } from "../../services/db";
import { callSpotify, spotify } from "../../services/spotify";

type Query = {
  songId?: string;
  force?: boolean;
};

export const addSong: RequestHandler<unknown, QueueResponse, unknown, Query> =
  async (req, res) => {
    const { songId, force } = req.query;

    if (!songId) {
      return res.json({
        success: false,
        error: "MISSING_PARAMETER",
      });
    }

    const user = await authorizeRequest(req.headers);

    if (!user) {
      return res.json({
        success: false,
        error: "INVALID_TOKEN",
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
        success: false,
        error: "ALREADY_UPDATED",
      });
    }

    // Validate that the Song Id is correct
    const track = await callSpotify(user, () => spotify.getTrack(songId)).catch(
      () => undefined
    );

    if (!track) {
      return res.json({
        success: false,
        error: "WRONG_PARAMETER",
      });
    }

    const updateUser = { ...user, queue: [...user.queue, songId] };

    // Append Item
    await updateItem(user.id, {
      expressionAttributeNames: { "#queue": "queue" },
      expressionAttributeValues: {
        ":new_item": [songId],
        ":empty_list": [],
      },
      updateExpression:
        "SET #queue = list_append(if_not_exists(#queue, :empty_list), :new_item)",
    });

    res.json({
      success: true,
      body: {
        queue: await generateQueue(user).then(transformQueue),
      },
    });
  };
