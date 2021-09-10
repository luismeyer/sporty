import { RequestHandler } from "express";

import { User, UserResponse } from "@sporty/api";

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
      error: "INVALID_TOKEN",
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

  const frontendUser = await transformUser(updatedUser);

  if (!frontendUser) {
    return res.json({ success: false, error: "INTERNAL_ERROR" });
  }

  res.json({
    success: true,
    body: frontendUser,
  });
};
