import { Module } from "vuex";

import { MessageResponse, FrontendSession, SessionResponse } from "@sporty/api";

import { fetchApi } from "../api";
import { RootState } from "./";

export type SessionState = {
  loading: boolean;
  session?: FrontendSession;
};

export const sessionModule: Module<SessionState, RootState> = {
  state: {
    loading: false,
  },

  mutations: {
    UPDATE_SESSION(state, session: FrontendSession) {
      state.session = session;
    },

    UPDATE_SESSION_LOADING(state, value) {
      state.loading = value;
    },
  },

  actions: {
    async fetchSession({ commit, dispatch }) {
      commit("UPDATE_SESSION_LOADING", true);

      // Reload the player
      dispatch("fetchPlayer");

      const response = await fetchApi<SessionResponse>("session");

      if (response.success) {
        commit("UPDATE_SESSION", response.body);
      } else {
        commit("UPDATE_SESSION", undefined);
      }

      commit("UPDATE_SESSION_LOADING", false);
    },

    async createSession({ commit, dispatch }) {
      commit("UPDATE_SESSION_LOADING", true);

      const response = await fetchApi<SessionResponse>("session/create");

      if (response.success) {
        commit("UPDATE_SESSION", response.body);

        dispatch("fetchPlayer");
      }

      commit("UPDATE_SESSION_LOADING", false);
    },

    async leaveSession({ commit, state }) {
      commit("UPDATE_SESSION_LOADING", true);

      if (!state.session) {
        return;
      }

      const response = await fetchApi<MessageResponse>("session/leave");

      if (response.success) {
        commit("UPDATE_SESSION", undefined);
        commit("UPDATE_PLAYER", undefined);
      }

      commit("UPDATE_SESSION_LOADING", false);
    },

    async joinSession({ commit }, session: string) {
      commit("UPDATE_SESSION_LOADING", true);

      const response = await fetchApi<SessionResponse>(
        "session/join",
        `session=${session}`
      );

      if (response.success) {
        commit("UPDATE_SESSION", response.body);
      }

      commit("UPDATE_SESSION_LOADING", false);
    },
  },
};
