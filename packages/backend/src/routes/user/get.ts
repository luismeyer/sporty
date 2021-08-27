import { RequestHandler } from "express";

import { UserResponse } from "@qify/api";

import { authorizeRequest, transformUser } from "../../helpers/user";

export const getUser: RequestHandler<unknown, UserResponse> = async (
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

  res.json({
    success: true,
    body: await transformUser(user),
  });
};
