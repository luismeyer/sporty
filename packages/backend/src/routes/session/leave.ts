import { RequestHandler } from "express";

import { MessageResponse } from "@qify/api";

import {
  authorizeRequest,
  removeUserFromSession,
  sessionUsers,
} from "../../helpers/user";
import { updateItem } from "../../services/db";

export const leaveSession: RequestHandler<unknown, MessageResponse> = async (
  req,
  res
) => {
  const user = await authorizeRequest(req.headers);

  if (!user) {
    return res.json({
      success: false,
      error: "INVALID_TOKEN",
    });
  }

  if (!user.session) {
    return res.json({
      success: false,
      error: "ALREADY_UPDATED",
    });
  }

  await removeUserFromSession(user);

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
