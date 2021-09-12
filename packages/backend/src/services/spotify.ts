import SpotifyWebApi from "spotify-web-api-node";

import { User } from "@sporty/api";

import {
  frontendUrl,
  spotifyClientId,
  spotifyClientSecret,
} from "../helpers/const";
import { UserService } from "./user";

const redirectUri = frontendUrl + "/callback";

if (!redirectUri) {
  throw new Error("Missing redirect URI");
}

export const spotify = new SpotifyWebApi({
  clientId: spotifyClientId,
  clientSecret: spotifyClientSecret,
  redirectUri,
});

export const codeGrant = async (code: string) => {
  return spotify.authorizationCodeGrant(code).catch(() => undefined);
};

export const authorizeURL = (...scopes: string[]) =>
  spotify.createAuthorizeURL(scopes, "");

export type UserInput = Pick<User, "id" | "accessToken" | "refreshToken">;

const setTokens = (user: UserInput) => {
  spotify.setAccessToken(user.accessToken);
  spotify.setRefreshToken(user.refreshToken);
};

const clearTokens = () => {
  spotify.setAccessToken("");
  spotify.setRefreshToken("");
};

export const refreshTokens = async (user: UserInput): Promise<UserInput> => {
  const result = await spotify.refreshAccessToken();

  const userService = new UserService(user);

  await userService.updateTokens(
    result.body.access_token,
    result.body.refresh_token
  );

  return {
    id: user.id,
    accessToken: result.body.access_token,
    refreshToken: result.body.refresh_token ?? "",
  };
};

export const callSpotify = async <T>(
  user: UserInput,
  fc: () => Promise<T>
): Promise<T | undefined> => {
  setTokens(user);

  return fc()
    .catch(async (error) => {
      console.log("Spotify error Message", error.message);
      console.log("Spotify error Status", error.statusCode);

      if (error.statusCode !== 401) {
        return;
      }

      console.log("Refreshing tokens");

      const newCreds = await refreshTokens(user);
      setTokens(newCreds);

      return fc();
    })
    .finally(() => clearTokens());
};

export const generateUri = (id: string) => `spotify:track:${id}`;
