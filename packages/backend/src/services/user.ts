import { updateItem } from './db';
import { callSpotify, spotify, UserInput } from './spotify';

export class UserService {
  private user: UserInput;

  constructor(user: UserInput) {
    this.user = user;
  }

  async updateTokens(accessToken: string, refreshToken?: string) {
    const expressionAttributeNames = {
      "#accessToken": "accessToken",
      ...(refreshToken && { "#refreshToken": "refreshToken" }),
    };

    const expressionAttributeValues = {
      ":accessToken": accessToken,
      ...(refreshToken && { ":refreshToken": refreshToken }),
    };

    const updateExpression = `SET #accessToken = :accessToken ${
      refreshToken ? ", #refreshToken = :refreshToken" : ""
    }`;

    await updateItem(this.user.id, {
      expressionAttributeNames,
      expressionAttributeValues,
      updateExpression,
    });
  }

  async hasActiveDevice() {
    const devices = await callSpotify(this.user, () => spotify.getMyDevices());

    if (!devices) {
      return false;
    }

    return devices.body.devices.some((device) => device.is_active);
  }
}
