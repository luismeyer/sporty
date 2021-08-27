import { RequestHandler } from "express";

import { User, UserResponse } from "@qify/api";

import { authorizeRequest, transformUser } from "../../helpers/user";
import { updateItem } from "../../services/db";

export const toggleIsPlayer: RequestHandler<unknown, UserResponse> = async (
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

  const updatedUser: User = {
    ...user,
    isPlayer: !user.isPlayer,
  };

  await updateItem(user.id, {
    expressionAttributeNames: { "#isPlayer": "isPlayer" },
    expressionAttributeValues: { ":isPlayer": !user.isPlayer },
    updateExpression: "SET #isPlayer = :isPlayer",
  });

  res.json({
    success: true,
    body: await transformUser(updatedUser),
  });
};
