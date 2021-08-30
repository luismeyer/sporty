import { User } from "@qify/api";

import { callSpotify, spotify } from "../services/spotify";

export const hasActiveDevice = async (users: User[]) => {
  const devices = await Promise.all(
    users.map((player) => callSpotify(player, () => spotify.getMyDevices()))
  );

  // Find if any Player has an active device
  return devices.some((response) =>
    response.body.devices.some((device) => device.is_active)
  );
};
