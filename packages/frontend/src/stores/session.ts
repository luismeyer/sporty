import { reactive } from "vue";

import { MessageResponse, Session, SessionResponse } from "@qify/api";

import { fetchApi } from "../api";

export type SessionStore = {
  state: {
    loading: boolean;
    session?: Session;
  };
  fetch: () => Promise<void>;
  create: () => Promise<void>;
  leave: () => Promise<void>;
  join: (session: string) => Promise<void>;
  hasData: () => boolean;
};

export const sessionStore: SessionStore = {
  state: reactive({
    loading: false,
  }),
  hasData() {
    return Boolean(this.state.session && !this.state.loading);
  },
  async fetch() {
    this.state.loading = true;
    const response = await fetchApi<SessionResponse>("session");

    if (response.success) {
      this.state.session = response.body;
    }

    this.state.loading = false;
  },
  async create() {
    this.state.loading = true;
    const response = await fetchApi<SessionResponse>("session/create");

    if (response.success) {
      this.state.session = response.body;
    }

    this.state.loading = false;
  },
  async leave() {
    this.state.loading = true;
    if (!this.state.session) {
      return;
    }

    const response = await fetchApi<MessageResponse>("session/leave");

    if (response.success) {
      this.state.session = undefined;
    }

    this.state.loading = false;
  },
  async join(session: string) {
    this.state.loading = true;
    const response = await fetchApi<SessionResponse>(
      "session/join",
      `session=${session}`
    );

    if (response.success) {
      this.state.session = response.body;
    }

    this.state.loading = false;
  },
};
