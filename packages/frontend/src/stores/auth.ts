import { LoginResponse, AuthorizeResponse } from "@qify/api";

import { fetchApi } from "../api";
import { reactive } from "vue";

export const storageKey = "qify-token";

export type AuthState = {
  isAuthenticated: boolean;
};

export type AuthStore = {
  state: AuthState;
  login: () => Promise<string>;
  authorize: (code: string) => Promise<string | undefined>;
};

export const authStore: AuthStore = {
  state: reactive({
    isAuthenticated: Boolean(localStorage.getItem("qify-token")),
  }),
  async login() {
    const res = await fetchApi<LoginResponse>("user/login");
    return res.success ? res.body.url : "";
  },
  async authorize(code: string) {
    const res = await fetchApi<AuthorizeResponse>(
      "user/authorize",
      `code=${code}`
    );

    if (!res.success) {
      return;
    }

    localStorage.setItem(storageKey, res.body.token);

    this.state.isAuthenticated = true;

    return res.body.token;
  },
};
