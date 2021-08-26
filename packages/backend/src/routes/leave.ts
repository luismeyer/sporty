import { RequestHandler } from "express";

import { authorizeRequest } from "../helpers/user";
import { updateItem } from "../services/db";

export const leave: RequestHandler = async (req, res) => {
  const user = await authorizeRequest(req.headers);

  if (!user) {
    return res.json({
      error: "Wrong token",
    });
  }

  await updateItem(user.id, {
    expressionAttributeNames: { "#session": "session", "#isOwner": "isOwner" },
    updateExpression: "Remove #session, #isOwner",
  });

  res.json({
    message: "success",
  });
};
