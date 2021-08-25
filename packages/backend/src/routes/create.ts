import { RequestHandler } from "express";

import { User } from "@qify/api";

import { getItem, putItem } from "../services/db";
import { createStateMachine } from "../services/state-machine";
import { callSpotify, spotify } from "../services/spotify";

export const create: RequestHandler = async (req, res) => {
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.json({
      error: "Missing Id",
    });
  }

  const user = await getItem<User>(id);

  if (!user) {
    res.json({
      error: "Couldn't find user",
    });

    return;
  }

  const session = String(Math.round(Math.random() * 9000 + 1000));

  await putItem<User>({
    ...user,
    session,
    isOwner: true,
    isPlayer: true,
  });

  const devices = await callSpotify(user, () => spotify.getMyDevices());

  const hasActiveDevice = devices.body.devices.some(
    (device) => device.is_active
  );

  let timeInMS = 10000;

  if (hasActiveDevice) {
    const { body } = await callSpotify(user, () =>
      spotify.getMyCurrentPlayingTrack()
    );

    const { item, progress_ms } = body;

    timeInMS = item && progress_ms ? item.duration_ms - progress_ms : 10000;
  }

  await createStateMachine(session, timeInMS);

  res.json({
    session,
  });
};
