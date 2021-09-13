import { User } from "@sporty/api";

import { getItem, updateItem } from "../services/db";

export class UserRepository {
  private user?: User;

  constructor(user?: User) {
    this.user = user;
  }

  async getUser(token: string): Promise<User | undefined> {
    return getItem<User>(token);
  }

  async deleteSession() {
    if (!this.user) {
      return;
    }

    return updateItem(this.user.id, {
      expressionAttributeNames: {
        "#session": "session",
        "#isOwner": "isOwner",
        "#queue": "queue",
      },
      expressionAttributeValues: {
        ":queue": [],
      },
      updateExpression: "REMOVE #session, #isOwner SET #queue = :queue",
    });
  }
}
