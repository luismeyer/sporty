import { Session, SessionUser, User } from '@sporty/api';

import { getItem, queryItems, sessionIndex } from '../services/db';

export class SessionRepository {
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  async getSession(): Promise<Session | undefined> {
    return getItem<Session>(this.sessionId);
  }

  async getUsers(): Promise<SessionUser[]> {
    return await queryItems<SessionUser>(sessionIndex, {
      expressionAttributeNames: { "#session": "session" },
      expressionAttributeValues: { ":session": this.sessionId },
      keyConditionExpression: "#session = :session",
    });
  }
}
