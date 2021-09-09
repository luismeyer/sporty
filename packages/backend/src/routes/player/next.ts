import { RequestHandler } from "express";

import { PlayerResponse, Track, User } from "@qify/api";

import { popQueueItem } from "../../helpers/queue";
import { playTrackInSession } from "../../helpers/track";
import { authorizeRequest } from "../../helpers/user";

const nextPlayerSession = async (
  user: User,
  track: Track
): Promise<PlayerResponse> => {
  const response = await playTrackInSession(user, track);

  if (!response) {
    return { success: false, error: "NO_SESSION" };
  }

  return {
    success: true,
    body: {
      isActive: true,
      currentTrack: response,
    },
  };
};

export const nextPlayer: RequestHandler<unknown, PlayerResponse> = async (
  req,
  res
) => {
  const user = await authorizeRequest(req.headers);

  if (!user) {
    return res.json({ success: false, error: "INVALID_TOKEN" });
  }

  if (!user.session) {
    return res.json({ success: false, error: "NO_SESSION" });
  }

  const item = await popQueueItem(user);

  if (!item) {
    return res.json({ success: false, error: "INTERNAL_ERROR" });
  }

  res.json(await nextPlayerSession(user, item.track));
};
