import { reactive } from "vue";

import { MessageResponse, Session, SessionResponse } from "@qify/api";

import { fetchApi } from "../api";

type SessionStore = {
  state: {
    hasData: boolean;
    session?: Session;
  };
  fetch: () => Promise<void>;
  create: () => Promise<void>;
  leave: () => Promise<void>;
  join: (session: string) => Promise<void>;
};

export const sessionStore: SessionStore = {
  state: reactive({
    hasData: false,
    users: [],
  }),
  async fetch() {
    const response = await fetchApi<SessionResponse>("get");

    if (response.success) {
      this.state.session = response.body;
      this.state.hasData = true;
    }
  },
  async create() {
    const response = await fetchApi<SessionResponse>("create");

    if (response.success) {
      this.state.session = response.body;
      this.state.hasData = true;
    }
  },
  async leave() {
    if (!this.state.session) {
      return;
    }

    const response = await fetchApi<MessageResponse>("leave");

    if (response.success) {
      this.state.session = undefined;
      this.state.hasData = true;
    }
  },
  async join(session: string) {
    const response = await fetchApi<SessionResponse>(
      "join",
      `session=${session}`
    );

    if (response.success) {
      this.state.session = response.body;
      this.state.hasData = true;
    }
  },
};
