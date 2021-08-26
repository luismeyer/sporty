import { RequestHandler } from "express";

import { MessageResponse } from "@qify/api";

import { authorizeRequest, sessionUsers } from "../helpers/user";
import { updateItem } from "../services/db";

export const leave: RequestHandler<unknown, MessageResponse> = async (
  req,
  res
) => {
  const user = await authorizeRequest(req.headers);

  if (!user) {
    return res.json({
      success: false,
      error: "Wrong token",
    });
  }

  if (!user.session) {
    return res.json({
      success: false,
      error: "No Session",
    });
  }

  await updateItem(user.id, {
    expressionAttributeNames: { "#session": "session", "#isOwner": "isOwner" },
    updateExpression: "Remove #session, #isOwner",
  });

  const users = await sessionUsers(user.session);

  if (users.length > 0) {
    const [newOwner] = users;

    await updateItem(newOwner.id, {
      expressionAttributeNames: { "#isOwner": "isOwner" },
      expressionAttributeValues: { ":isOwner": true },
      updateExpression: "SET #isOwner = :isOwner",
    });
  }

  res.json({
    success: true,
    body: {
      message: "Success",
    },
  });
};
