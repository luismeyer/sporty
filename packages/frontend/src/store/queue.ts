import { Module } from "vuex";

import { Queue, QueueResponse } from "@qify/api";

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
    updateQueue(state, queue: Queue) {
      state.queue = queue;
    },

    updateLoading(state, newState: boolean) {
      state.loading = newState;
    },
  },

  actions: {
    async fetchQueue({ commit }) {
      commit("updateLoading", true);

      const response = await fetchApi<QueueResponse>("queue");

      if (response.success) {
        commit("updateQueue", response.body.queue);
      }

      commit("updateLoading", false);
    },

    async addSongToQueue({ commit }, id: string) {
      commit("updateLoading", true);

      const response = await fetchApi<QueueResponse>(
        "queue/add",
        `songId=${id}`
      );

      if (response.success) {
        commit("updateQueue", response.body.queue);
      }

      commit("updateLoading", false);
    },

    async removeSongFromQueue({ commit }, id: string) {
      commit("updateLoading", true);

      const response = await fetchApi<QueueResponse>(
        "queue/remove",
        `songId=${id}`
      );

      if (response.success) {
        commit("updateQueue", response.body.queue);
      }

      commit("updateLoading", false);
    },
  },
};
