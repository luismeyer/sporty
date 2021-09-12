import { Request } from "express";

import { Session, User } from "@sporty/api";

import { UserRepository } from "../repositories/user.repo";
import { getItem } from "./db";

export class RequestService {
  private readonly request: Request;
  private readonly userRepo: UserRepository;

  private user: User | undefined;

  constructor(req: Request<any, any, any, any>) {
    this.request = req;
    this.userRepo = new UserRepository();
  }

  async getUser(): Promise<User | undefined> {
    const { authorization } = this.request.headers;

    if (!authorization) {
      return;
    }

    const [_, token] = authorization.split(" ");

    if (!token) {
      return;
    }

    this.user = await this.userRepo.getUser(token);

    return this.user;
  }

  async getSession(): Promise<Session | undefined> {
    const user = this.user ?? (await this.getUser());

    if (!user?.session) {
      return;
    }

    return getItem<Session>(user.session);
  }
}
