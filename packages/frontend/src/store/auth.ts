import { Module } from "vuex";

import { AuthorizeResponse, LoginResponse } from "@qify/api";

import { fetchApi } from "../api";
import { RootState } from "./";

export const storageKey = "qify-token";

export type AuthState = {
  isAuthenticated: boolean;
  loginUrl?: string;
};

export const authModule: Module<AuthState, RootState> = {
  state: {
    isAuthenticated: Boolean(localStorage.getItem("qify-token")),
  },

  mutations: {
    login(state, url) {
      state.loginUrl = url;
    },
    authorize(state) {
      state.isAuthenticated = true;
    },
  },

  actions: {
    async login({ commit }) {
      const res = await fetchApi<LoginResponse>("user/login");

      if (res.success) {
        commit("login", res.body.url);
      }
    },

    async authorize({ commit }, code: string) {
      const res = await fetchApi<AuthorizeResponse>(
        "user/authorize",
        `code=${code}`
      );

      if (!res.success) {
        return;
      }

      localStorage.setItem(storageKey, res.body.token);

      commit("authorize");
    },
  },
};
