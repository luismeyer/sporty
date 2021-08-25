import { RequestHandler } from "express";

import { User } from "@qify/api";

import { getItem, updateItem } from "../services/db";

export const leave: RequestHandler = async (req, res) => {
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.json({
      error: "Missing Id",
    });
  }

  const user = await getItem<User>(id);

  if (!user) {
    return res.json({
      error: "Cannot find user",
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
