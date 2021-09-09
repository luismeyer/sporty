import { RequestHandler } from "express";

import { MessageResponse, Session } from "@qify/api";

import { deleteSession } from "../../helpers/session";
import {
  authorizeRequest,
  removeUserFromSession,
  sessionUsers,
} from "../../helpers/user";
import { getItem, updateItem } from "../../services/db";

export const leaveSession: RequestHandler<unknown, MessageResponse> = async (
  req,
  res
) => {
  const user = await authorizeRequest(req.headers);

  if (!user) {
    return res.json({ success: false, error: "INVALID_TOKEN" });
  }

  if (!user.session) {
    return res.json({ success: false, error: "ALREADY_UPDATED" });
  }

  const session = await getItem<Session>(user.session);

  if (!session) {
    return res.json({ success: false, error: "INTERNAL_ERROR" });
  }

  await removeUserFromSession(user);

  const users = await sessionUsers(session.id).then((res) =>
    res.filter(({ id }) => id !== user.id)
  );

  if (users.length === 0) {
    await deleteSession(session, users);

    return res.json({
      success: true,
      body: {
        message: "Deleted session",
      },
    });
  }

  const newOwner = users[0];

  await updateItem(newOwner.id, {
    expressionAttributeNames: { "#isOwner": "isOwner" },
    expressionAttributeValues: { ":isOwner": true },
    updateExpression: "SET #isOwner = :isOwner",
  });

  res.json({
    success: true,
    body: {
      message: "Success",
    },
  });
};
