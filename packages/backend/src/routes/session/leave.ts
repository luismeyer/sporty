import { RequestHandler } from 'express';

import { MessageResponse, Session } from '@sporty/api';

import { getItem, updateItem } from '../../services/db';
import { RequestService } from '../../services/request.service';
import { SessionService } from '../../services/session.service';

export const leaveSession: RequestHandler<unknown, MessageResponse> = async (
  req,
  res
) => {
  const requestService = new RequestService(req);
  const user = await requestService.getUser();

  if (!user) {
    return res.json({ success: false, error: "INVALID_TOKEN" });
  }

  const session = await requestService.getSession();

  if (!session) {
    return res.json({ success: false, error: "NO_SESSION" });
  }

  const sessionService = new SessionService(session);

  const users = await sessionService.removeUser(user);

  if (users.length === 0) {
    await sessionService.delete();

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
