import { Request } from "express";

import { FrontendUser, User } from "@sporty/api";

import { getItem, queryItems, sessionIndex, updateItem } from "../services/db";
import { callSpotify, spotify } from "../services/spotify";
import { filterNullish } from "./array";

export const updateTokens = async (
  id: string,
  accessToken: string,
  refreshToken?: string
) => {
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

  await updateItem(id, {
    expressionAttributeNames,
    expressionAttributeValues,
    updateExpression,
  });
};

export const sessionUsers = async (session: string) => {
  return await queryItems<User>(sessionIndex, {
    expressionAttributeNames: { "#session": "session" },
    expressionAttributeValues: { ":session": session },
    keyConditionExpression: "#session = :session",
  });
};

export const authorizeRequest = async (
  headers: Request["headers"]
): Promise<User | undefined> => {
  const { authorization } = headers;

  if (!authorization) {
    return;
  }

  const [_, token] = authorization.split(" ");

  if (!token) {
    return;
  }

  return getItem(token);
};

export const transformUser = async (
  user: User
): Promise<FrontendUser | undefined> => {
  const sUser = await callSpotify(user, () => spotify.getMe());

  if (!sUser) {
    return;
  }

  return {
    name: sUser.body.display_name ?? user.spotifyId,
    image: sUser.body.images?.[0].url,
    isOwner: user.isOwner,
    isPlayer: user.isPlayer,
    tracksInQueue: user.queue.length,
  };
};

export const transformUsers = async (
  users: User[]
): Promise<FrontendUser[]> => {
  return Promise.all(users.map(transformUser)).then(filterNullish);
};

export const removeUserFromSession = async (user: User) => {
  await updateItem(user.id, {
    expressionAttributeNames: {
      "#session": "session",
      "#isOwner": "isOwner",
      "#queue": "queue",
    },
    expressionAttributeValues: {
      ":queue": [],
    },
    updateExpression: "REMOVE #session, #isOwner SET #queue = :queue",
  });
};
