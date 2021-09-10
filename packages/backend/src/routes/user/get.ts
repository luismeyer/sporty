import { RequestHandler } from "express";

import { UserResponse } from "@sporty/api";

import { authorizeRequest, transformUser } from "../../helpers/user";

export const getUser: RequestHandler<unknown, UserResponse> = async (
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

  const frontendUser = await transformUser(user);

  if (!frontendUser) {
    return res.json({ success: false, error: "INTERNAL_ERROR" });
  }

  res.json({
    success: true,
    body: frontendUser,
  });
};
