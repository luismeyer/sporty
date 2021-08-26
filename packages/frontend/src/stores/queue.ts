import { reactive } from "vue";

import { QueueResponse, Track } from "@qify/api";

import { fetchApi } from "../api";

export const storageKey = "qify-token";

type QueueStore = {
  state: {
    queue?: Track[];
  };
  fetch: () => Promise<void>;
  addSong: (id: string) => Promise<void>;
  removeSong: (id: string) => Promise<void>;
};

export const queueStore: QueueStore = {
  state: reactive({
    queue: undefined,
  }),
  async fetch() {
    const response = await fetchApi<QueueResponse>("queue");

    if (response.success) {
      this.state.queue = response.body.queue;
    }
  },
  async addSong(id: string) {
    const response = await fetchApi<QueueResponse>("add", `songId=${id}`);

    if (response.success) {
      this.state.queue = response.body.queue;
    }
  },
  async removeSong(id: string) {
    const response = await fetchApi<QueueResponse>("remove", `songId=${id}`);

    if (response.success) {
      console.log(response.body);
      this.state.queue = response.body.queue;
    }
  },
};
