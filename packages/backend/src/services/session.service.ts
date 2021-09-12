import { Session, SessionUser, User } from "@sporty/api";

import { filterNullish } from "../helpers/array";
import { SessionRepository } from "../repositories/session.repo";
import { transformSession } from "../transformers/session";
import { transformUser } from "../transformers/user";
import { deleteItem, updateItem } from "./db";
import { deleteStateMachine, stopStateMachineExecution } from "./state-machine";
import { UserService } from "./user";

export class SessionService {
  private users: SessionUser[] | undefined;

  private session: Session;
  private sessionRepo: SessionRepository;

  constructor(session: Session) {
    this.session = session;
    this.sessionRepo = new SessionRepository(this.session.id);
  }

  async getUsers() {
    this.users = await this.sessionRepo.getUsers();

    return this.users;
  }

  async removeUser(user: User): Promise<SessionUser[]> {
    await updateItem(user.id, {
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

    const sessionUsers = this.users ?? (await this.getUsers());

    return sessionUsers.filter((u) => u.id !== user.id);
  }

  async findSessionOwner() {
    const sessionUsers = this.users ?? (await this.getUsers());

    return sessionUsers.find((u) => u.isOwner);
  }

  async updateTimeout(timeout: string) {
    await updateItem(this.session.id, {
      expressionAttributeNames: {
        "#timeout": "timeout",
      },
      expressionAttributeValues: {
        ":timeout": timeout,
      },
      updateExpression: "SET #timeout = :timeout ",
    });
  }

  async delete() {
    await stopStateMachineExecution(this.session);

    await deleteItem(this.session.id);

    await deleteStateMachine(this.session.id);

    const sessionUsers = this.users ?? (await this.getUsers());
    await Promise.all(sessionUsers.map(this.removeUser));
  }

  async hasActiveDevices() {
    const sessionUsers = this.users ?? (await this.getUsers());

    const isActiveList = await Promise.all(
      sessionUsers.map((user) => {
        const userService = new UserService(user);

        return userService.hasActiveDevice();
      })
    );

    return isActiveList.some((value) => value);
  }

  async get() {
    const sessionUsers = this.users ?? (await this.getUsers());

    const frontendUsers = await Promise.all(sessionUsers.map(transformUser));

    return transformSession(this.session, filterNullish(frontendUsers));
  }
}
