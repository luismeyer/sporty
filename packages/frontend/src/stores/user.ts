import { reactive } from "vue";

import { FrontendUser, UserResponse } from "@qify/api";

import { fetchApi } from "../api";

export type UserStore = {
  state: {
    loading: boolean;
    user?: FrontendUser;
  };
  fetch: () => Promise<void>;
  toggleIsPlayer: () => Promise<void>;
};

export const userStore: UserStore = {
  state: reactive({
    loading: false,
  }),
  async fetch() {
    this.state.loading = true;
    const response = await fetchApi<UserResponse>("user");

    if (response.success) {
      this.state.user = response.body;
    }

    this.state.loading = false;
  },
  async toggleIsPlayer() {
    this.state.loading = true;
    const response = await fetchApi<UserResponse>("user/player");

    if (response.success) {
      this.state.user = response.body;
    }
    this.state.loading = false;
  },
};
