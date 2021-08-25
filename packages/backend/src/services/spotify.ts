import SpotifyWebApi from "spotify-web-api-node";

import { User } from "@qify/api";

import { spotifyClientId, spotifyClientSecret } from "../helpers/const";
import { updateTokens } from "../helpers/user";

const { CALLBACK_URL, IS_OFFLINE } = process.env;

const redirectUri = IS_OFFLINE
  ? "http://localhost:3000/authorize"
  : CALLBACK_URL;

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

type UserInput = Pick<User, "id" | "accessToken" | "refreshToken">;

const setTokens = (user: UserInput) => {
  spotify.setAccessToken(user.accessToken);
  spotify.setRefreshToken(user.refreshToken);
};

export const refreshTokens = async (user: UserInput): Promise<UserInput> => {
  const result = await spotify.refreshAccessToken();

  await updateTokens(
    user.id,
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
): Promise<T> => {
  setTokens(user);

  return fc().catch(async (error) => {
    const newCreds = await refreshTokens(user);
    setTokens(newCreds);

    return fc();
  });
};
