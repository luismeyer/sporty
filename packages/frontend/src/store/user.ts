import { Module } from "vuex";

import {
  AuthorizeResponse,
  FrontendUser,
  LoginResponse,
  UserResponse,
} from "@qify/api";

import { fetchApi } from "../api";
import { RootState } from "./";
export const storageKey = "qify-token";

export type UserState = {
  loading: boolean;
  user?: FrontendUser;
  loginUrl?: string;
  isAuthenticated: boolean;
};

export const userModule: Module<UserState, RootState> = {
  state: {
    loading: false,
    isAuthenticated: Boolean(localStorage.getItem(storageKey)),
  },

  mutations: {
    UPDATE_USER(state, newUser: FrontendUser) {
      state.user = newUser;
    },

    UPDATE_USER_LOADING(state, newState: boolean) {
      state.loading = newState;
    },

    LOGIN(state, url) {
      state.loginUrl = url;
    },

    AUTHORIZE(state, token: string) {
      localStorage.setItem(storageKey, token);

      state.isAuthenticated = true;
    },

    UNAUTHORIZE(state) {
      localStorage.removeItem(storageKey);

      state.isAuthenticated = false;
    },
  },

  actions: {
    async fetchUser({ commit }) {
      commit("UPDATE_USER_LOADING", true);

      const response = await fetchApi<UserResponse>("user");

      if (response.success) {
        commit("UPDATE_USER", response.body);
      } else {
        commit("UNAUTHORIZE");
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

    async login({ commit }) {
      commit("UPDATE_USER_LOADING", true);

      const res = await fetchApi<LoginResponse>("user/login");

      if (res.success) {
        commit("LOGIN", res.body.url);
      }

      commit("UPDATE_USER_LOADING", false);
    },

    async authorize({ commit }, code: string) {
      commit("UPDATE_USER_LOADING", true);

      const res = await fetchApi<AuthorizeResponse>(
        "user/authorize",
        `code=${code}`
      );

      if (!res.success) {
        commit("UPDATE_USER_LOADING", false);
        return;
      }

      commit("AUTHORIZE", res.body.token);

      commit("UPDATE_USER_LOADING", false);
    },
  },
};
