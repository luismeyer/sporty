import { User } from "@sporty/api";

import { callSpotify, spotify } from "../services/spotify";

export const hasActiveDevice = async (user: User) => {
  const devices = await callSpotify(user, () => spotify.getMyDevices());

  if (!devices) {
    return false;
  }

  return devices.body.devices.some((device) => device.is_active);
};

export const hasActiveDevices = async (users: User[]) => {
  return Promise.all(users.map(hasActiveDevice));
};
