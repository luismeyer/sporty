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
    UPDATE_USER(state, newUser: FrontendUser) {
      state.user = newUser;
    },

    UPDATE_USER_LOADING(state, newState: boolean) {
      state.loading = newState;
    },
  },

  actions: {
    async fetchUser({ commit }) {
      commit("UPDATE_USER_LOADING", true);

      const response = await fetchApi<UserResponse>("user");

      if (response.success) {
        commit("UPDATE_USER", response.body);
      }

      commit("UPDATE_USER_LOADING", false);
    },

    async toggleIsPlayer({ commit }) {
      commit("UPDATE_USER_LOADING", true);
      const response = await fetchApi<UserResponse>("user/player");

      if (response.success) {
        commit("UPDATE_USER", response.body);
      }

      commit("UPDATE_USER_LOADING", false);
    },
  },
};
