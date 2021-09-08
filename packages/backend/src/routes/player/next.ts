import { RequestHandler } from "express";

import { PlayerResponse, Track, User } from "@qify/api";

import { generateQueue } from "../../helpers/queue";
import { playTrack } from "../../helpers/track";
import { authorizeRequest, sessionUsers } from "../../helpers/user";
import { updateItem } from "../../services/db";

const nextPlayerAlone = async (
  user: User,
  track: Track
): Promise<PlayerResponse> => {
  // Send request to spotify
  const success = await playTrack(user, track.id);

  if (!success) {
    return {
      success: false,
      error: "NO_ACTIVE_DEVICE",
    };
  }

  return {
    success: true,
    body: {
      isActive: true,
      currentTrack: track,
    },
  };
};

const nextPlayerSession = async (
  user: User,
  track: Track
): Promise<PlayerResponse> => {
  // Make TS Happy
  if (!user.session) {
    return {
      success: false,
      error: "NO_SESSION",
    };
  }

  // Get all Players
  const users = await sessionUsers(user.session);
  const players = users.filter((u) => u.isPlayer);

  // Send requests to spotify
  await Promise.all(
    players.map(async (player) => {
      await playTrack(player, track.id);
    })
  );

  return {
    success: true,
    body: {
      isActive: true,
      currentTrack: track,
    },
  };
};

export const nextPlayer: RequestHandler<unknown, PlayerResponse> = async (
  req,
  res
) => {
  const user = await authorizeRequest(req.headers);

  if (!user) {
    return res.json({
      success: false,
      error: "INVALID_TOKEN",
    });
  }

  const [item] = await generateQueue(user, 1);

  // TODO create next song automatic
  if (!item) {
    return res.json({
      success: false,
      error: "NOT_IMPLEMENTED",
    });
  }

  if (!user.session) {
    return res.json(await nextPlayerAlone(user, item.track));
  }

  // Remove item from player queue
  await updateItem(item.user.id, {
    expressionAttributeNames: { "#queue": "queue" },
    updateExpression: "REMOVE #queue[0]",
  });

  res.json(await nextPlayerSession(user, item.track));
};
