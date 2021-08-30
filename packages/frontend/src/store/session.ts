import { Module } from "vuex";

import { MessageResponse, Session, SessionResponse } from "@qify/api";

import { fetchApi } from "../api";
import { RootState } from "./";

export type SessionState = {
  loading: boolean;
  session?: Session;
};

export const sessionModule: Module<SessionState, RootState> = {
  state: {
    loading: false,
  },

  mutations: {
    updateSession(state, session: Session) {
      state.session = session;
    },

    updateLoading(state, value) {
      state.loading = value;
    },
  },

  actions: {
    async fetchSession({ commit }) {
      commit("updateLoading", true);

      const response = await fetchApi<SessionResponse>("session");

      if (response.success) {
        commit("updateSession", response.body);
      }

      commit("updateLoading", false);
    },

    async createSession({ commit }) {
      commit("updateLoading", true);

      const response = await fetchApi<SessionResponse>("session/create");

      if (response.success) {
        commit("updateSession", response.body);
      }

      commit("updateLoading", false);
    },

    async leaveSession({ commit, state }) {
      commit("updateLoading", true);

      if (!state.session) {
        return;
      }

      const response = await fetchApi<MessageResponse>("session/leave");

      if (response.success) {
        commit("updateSession", undefined);
        state.session = undefined;
      }

      commit("updateLoading", false);
    },

    async joinSession({ commit }, session: string) {
      commit("updateLoading", true);

      const response = await fetchApi<SessionResponse>(
        "session/join",
        `session=${session}`
      );

      if (response.success) {
        commit("updateSession", response.body);
      }

      commit("updateLoading", false);
    },
  },
};
