import { Commit, Module } from "vuex";

import { Player, PlayerResponse } from "@sporty/api";

import { fetchApi } from "../api";
import { RootState } from "../store/index";

export type PlayerState = {
  player?: Player;
  loading: boolean;
};

const playerAction = async (commit: Commit, path: string) => {
  commit("UPDATE_PLAYER_LOADING", true);

  const response = await fetchApi<PlayerResponse>(path);

  if (response.success) {
    commit("UPDATE_PLAYER", response.body);
  } else {
    commit("UPDATE_PLAYER", undefined);
  }

  commit("UPDATE_PLAYER_LOADING", false);
};

export const playerModule: Module<PlayerState, RootState> = {
  state: {
    loading: false,
  },

  mutations: {
    UPDATE_PLAYER(state, player: Player) {
      state.player = player;
    },

    UPDATE_PLAYER_LOADING(state, newState: boolean) {
      state.loading = newState;
    },
  },

  actions: {
    async fetchPlayer({ commit, state }) {
      if (state.loading) {
        return;
      }

      await playerAction(commit, "player");
    },

    async startPlayer({ commit }) {
      await playerAction(commit, "player/start");
    },

    async pausePlayer({ commit }) {
      await playerAction(commit, "player/pause");
    },

    async nextPlayer({ commit, dispatch }) {
      await playerAction(commit, "player/next");
      dispatch("fetchData");
    },
  },
};
