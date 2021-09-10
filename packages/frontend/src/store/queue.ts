import { Module } from "vuex";

import { Queue, QueueResponse } from "@sporty/api";

import { fetchApi } from "../api";
import { RootState } from "../store/index";

export type QueueState = {
  queue?: Queue;
  loading: boolean;
};

export const queueModule: Module<QueueState, RootState> = {
  state: {
    queue: undefined,
    loading: false,
  },

  mutations: {
    UPDATE_QUEUE(state, queue: Queue) {
      state.queue = queue;
    },

    UPDATE_QUEUE_LOADING(state, newState: boolean) {
      state.loading = newState;
    },
  },

  actions: {
    async fetchQueue({ commit, dispatch }) {
      commit("UPDATE_QUEUE_LOADING", true);

      // Reload the player
      dispatch("fetchPlayer");

      const response = await fetchApi<QueueResponse>("queue");

      if (response.success) {
        commit("UPDATE_QUEUE", response.body.queue);
      }

      commit("UPDATE_QUEUE_LOADING", false);
    },

    async addSongToQueue({ commit }, id: string) {
      commit("UPDATE_QUEUE_LOADING", true);

      const response = await fetchApi<QueueResponse>(
        "queue/add",
        `songId=${id}`
      );

      if (response.success) {
        commit("UPDATE_QUEUE", response.body.queue);
      }

      commit("UPDATE_QUEUE_LOADING", false);
    },

    async removeSongFromQueue({ commit }, id: string) {
      commit("UPDATE_QUEUE_LOADING", true);

      const response = await fetchApi<QueueResponse>(
        "queue/remove",
        `songId=${id}`
      );

      if (response.success) {
        commit("UPDATE_QUEUE", response.body.queue);
      }

      commit("UPDATE_QUEUE_LOADING", false);
    },
  },
};
