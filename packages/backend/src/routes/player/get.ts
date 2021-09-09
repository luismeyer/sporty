import { RequestHandler } from "express";

import { Player, PlayerResponse } from "@qify/api";

import { transformTrack } from "../../helpers/track";
import { authorizeRequest } from "../../helpers/user";
import { callSpotify, spotify } from "../../services/spotify";

export const getPlayer: RequestHandler<unknown, PlayerResponse> = async (
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

  const playBackState = await callSpotify(user, () =>
    spotify.getMyCurrentPlaybackState()
  );

  if (!playBackState) {
    return res.json({ success: false, error: "INTERNAL_ERROR" });
  }

  let resBody: Player | undefined;

  const { body } = playBackState;

  if (body.is_playing && body.currently_playing_type === "track") {
    const track = body.item as SpotifyApi.TrackObjectFull;
    const currentTrack = await transformTrack(user, track);

    resBody = currentTrack && {
      isActive: true,
      currentTrack,
    };
  }

  res.json({
    success: true,
    body: resBody ?? {
      isActive: false,
    },
  });
};
