import { User } from '@sporty/api';

import { getItem, queryItems, sessionIndex } from '../services/db';

export class UserRepository {
  async getUser(token: string): Promise<User | undefined> {
    return getItem<User>(token);
  }

  async getUsersInSession(sessionId: string): Promise<User[]> {
    return await queryItems<User>(sessionIndex, {
      expressionAttributeNames: { "#session": "session" },
      expressionAttributeValues: { ":session": sessionId },
      keyConditionExpression: "#session = :session",
    });
  }
}
