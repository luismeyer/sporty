import { Session, SessionUser, User } from "@sporty/api";

import { filterNullish } from "../helpers/array";
import { SessionRepository } from "../repositories/session.repo";
import { UserRepository } from "../repositories/user.repo";
import { transformSession } from "../transformers/session";
import { transformUser } from "../transformers/user";
import { deleteItem } from "./db";
import { StateMachineService } from "./machine.service";
import { UserService } from "./user";

export class SessionService {
  private users: SessionUser[] | undefined;

  private session: Session;
  private sessionRepo: SessionRepository;
  private machineService: StateMachineService;

  constructor(session: Session) {
    this.session = session;
    this.sessionRepo = new SessionRepository(this.session.id);
    this.machineService = new StateMachineService(session);
  }

  async getUsers() {
    if (!this.users) {
      this.users = await this.sessionRepo.getUsers();
    }

    return this.users;
  }

  async removeUser(user: User): Promise<SessionUser[]> {
    const userRepo = new UserRepository(user);
    await userRepo.deleteSession();

    const sessionUsers = await this.getUsers();

    return sessionUsers.filter((u) => u.id !== user.id);
  }

  async findSessionOwner() {
    const sessionUsers = await this.getUsers();

    return sessionUsers.find((u) => u.isOwner);
  }

  async updateTimeout(timeout: string) {
    return this.sessionRepo.setTimeout(timeout);
  }

  async delete() {
    await this.machineService.stopExecution();

    await deleteItem(this.session.id);

    await this.machineService.deleteMachine();

    const sessionUsers = this.users ?? (await this.getUsers());
    await Promise.all(sessionUsers.map(this.removeUser));
  }

  async hasActiveDevices() {
    const sessionUsers = await this.getUsers();

    const isActiveList = await Promise.all(
      sessionUsers.map((user) => {
        const userService = new UserService(user);

        return userService.hasActiveDevice();
      })
    );

    return isActiveList.some((value) => value);
  }

  async get() {
    const sessionUsers = await this.getUsers();

    const frontendUsers = await Promise.all(sessionUsers.map(transformUser));

    return transformSession(this.session, filterNullish(frontendUsers));
  }
}
