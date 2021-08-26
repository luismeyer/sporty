import { Request } from "express";

import { User } from "@qify/api";

import { getItem, queryItems, sessionIndex, updateItem } from "../services/db";

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

  return getItem(token);
};
