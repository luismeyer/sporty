import { Module } from "vuex";

import { FrontendUser, UserResponse } from "@qify/api";

import { fetchApi } from "../api";
import { RootState } from "./";

export type UserState = {
  loading: boolean;
  user?: FrontendUser;
};

export const userModule: Module<UserState, RootState> = {
  state: {
    loading: false,
  },

  mutations: {
    updateUser(state, newUser: FrontendUser) {
      state.user = newUser;
    },

    updateLoading(state, newState: boolean) {
      state.loading = newState;
    },
  },

  actions: {
    async fetchUser({ commit }) {
      commit("updateLoading", true);

      const response = await fetchApi<UserResponse>("user");

      if (response.success) {
        commit("updateUser", response.body);
      }

      commit("updateLoading", false);
    },

    async toggleIsPlayer({ commit }) {
      commit("updateLoading", true);
      const response = await fetchApi<UserResponse>("user/player");

      if (response.success) {
        commit("updateUser", response.body);
      }

      commit("updateLoading", false);
    },
  },
};
