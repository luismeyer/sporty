import crypto from "crypto";
import { RequestHandler } from "express";
import { v4 } from "uuid";

import { AuthorizeResponse, User } from "@qify/api";

import { qifySecret } from "../../helpers/const";
import { updateTokens } from "../../helpers/user";
import { putItem, queryItems, spotifyIdIndex } from "../../services/db";
import { callSpotify, codeGrant, spotify } from "../../services/spotify";

const hashId = (id: string) => {
  return crypto.createHmac("sha256", qifySecret).update(id).digest("hex");
};

const queryUserBySpotifyId = async (id: string) => {
  const expressionAttributeNames = { "#spotifyId": "spotifyId" };
  const expressionAttributeValues = { ":spotifyId": id };

  return await queryItems<User>(spotifyIdIndex, {
    expressionAttributeNames,
    expressionAttributeValues,
    keyConditionExpression: "#spotifyId = :spotifyId",
  });
};

type Query = {
  code?: string;
};

export const authorizeUser: RequestHandler<
  unknown,
  AuthorizeResponse,
  unknown,
  Query
> = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    res.json({
      success: false,
      error: "MISSING_PARAMETER",
    });
    return;
  }

  // Retrieve tokens from the code
  const codeResponse = await codeGrant(code);

  if (!codeResponse || !codeResponse.body.access_token) {
    return res.json({
      success: false,
      error: "INTERNAL_ERROR",
    });
  }

  const { access_token, refresh_token } = codeResponse.body;

  // Generate ID
  const id = hashId(v4());

  // Request spotify profile data
  const meResponse = await callSpotify(
    {
      id,
      accessToken: access_token,
      refreshToken: refresh_token,
    },
    () => spotify.getMe()
  );

  if (!meResponse) {
    return res.json({ success: false, error: "INTERNAL_ERROR" });
  }

  // Search user in DB by spotify id
  const [user] = await queryUserBySpotifyId(meResponse.body.id);

  // Update tokens and return id
  if (user) {
    await updateTokens(user.id, access_token, refresh_token);

    return res.json({ success: true, body: { token: user.id } });
  }

  // Insert new user in DB
  const newUser = await putItem<User>({
    id,
    spotifyId: meResponse.body.id,
    accessToken: access_token,
    refreshToken: refresh_token,
    isPlayer: false,
    queue: [],
  });

  // Return if DB injection went wrong
  if (!newUser) {
    res.json({
      success: false,
      error: "INTERNAL_ERROR",
    });

    return;
  }

  res.json({
    success: true,
    body: {
      token: newUser.id,
    },
  });
};
