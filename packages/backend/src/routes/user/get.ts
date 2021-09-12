import { RequestHandler } from 'express';

import { UserResponse } from '@sporty/api';

import { RequestService } from '../../services/request.service';
import { transformUser } from '../../transformers/user';

export const getUser: RequestHandler<unknown, UserResponse> = async (
  req,
  res
) => {
  const requestService = new RequestService(req);
  const user = await requestService.getUser();

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
