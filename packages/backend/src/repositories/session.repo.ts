import { Session, SessionUser, User } from "@sporty/api";

import { getItem, queryItems, sessionIndex, updateItem } from "../services/db";

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

  setExecutionArn(executionArn: string) {
    return updateItem(this.sessionId, {
      expressionAttributeNames: { "#executionArn": "executionArn" },
      expressionAttributeValues: { ":executionArn": executionArn },
      updateExpression: "SET #executionArn = :executionArn",
    });
  }

  removeExecutionArn() {
    return updateItem(this.sessionId, {
      expressionAttributeNames: { "#executionArn": "executionArn" },
      updateExpression: "REMOVE #executionArn",
    });
  }

  setTimeout(timeout: string) {
    return updateItem(this.sessionId, {
      expressionAttributeNames: { "#timeout": "timeout" },
      expressionAttributeValues: { ":timeout": timeout },
      updateExpression: "SET #timeout = :timeout ",
    });
  }
}
