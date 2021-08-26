import crypto from "crypto";
import { RequestHandler } from "express";
import { v4 } from "uuid";

import { User } from "@qify/api";

import { qifySecret } from "../helpers/const";
import { updateTokens } from "../helpers/user";
import { putItem, queryItems, spotifyIdIndex } from "../services/db";
import { callSpotify, codeGrant, spotify } from "../services/spotify";

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

export const authorize: RequestHandler = async (req, res) => {
  const { code } = req.query;

  if (typeof code !== "string") {
    return;
  }

  // Retrieve tokens from the code
  const codeResponse = await codeGrant(code);

  if (!codeResponse || !codeResponse.body.access_token) {
    return res.json(codeResponse);
  }

  const { access_token, refresh_token } = codeResponse.body;

  // Generate ID
  const id = hashId(v4());

  // Request spotify profile data
  const { body } = await callSpotify(
    {
      id,
      accessToken: access_token,
      refreshToken: refresh_token,
    },
    () => spotify.getMe()
  );

  // Search user in DB by spotify id
  const [user] = await queryUserBySpotifyId(body.id);

  // Update tokens and return id
  if (user) {
    await updateTokens(user.id, access_token, refresh_token);

    return res.json({
      token: user.id,
    });
  }

  // Insert new user in DB
  const newUser = await putItem<User>({
    id,
    spotifyId: body.id,
    accessToken: access_token,
    refreshToken: refresh_token,
    queue: [],
  });

  // Return if DB injection went wrong
  if (!newUser) {
    res.json({
      error: "Coulnd't create user",
    });

    return;
  }

  res.json({
    token: newUser.id,
  });
};
