<template>
  <transition name="player-fade">
    <div class="player" v-if="(!loading || player) && player?.isActive">
      <img class="track-image" :src="player.data.track.image.url" />

      <div class="player-track">
        <span class="player-track-name">{{ player.data.track.name }}</span>
        <span class="player-artists">{{
          player.data.track.artists.join(", ")
        }}</span>
      </div>

      <div class="player-icons" v-if="!loading">
        <svg
          @click="handlePlayPause"
          class="player-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="white"
        >
          <path v-if="player.data.isPlaying" d="M8 7h3v10H8zm5 0h3v10h-3z" />
          <path v-else d="M7 6v12l10-6z" />
        </svg>

        <svg
          @click="handleNext"
          class="player-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="white"
        >
          <path d="M7 7v10l7-5zm9 10V7h-2v10z" />
        </svg>
      </div>

      <Spinner
        class="player-icons"
        size="48px"
        v-if="loading"
        :spinning="true"
      />

      <div ref="loadingBar" class="loading-bar" />
    </div>
  </transition>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  ref,
  watch,
  watchEffect,
} from "vue";

import Spinner from "./Spinner.vue";
import { useStore } from "../store";

export default defineComponent({
  components: {
    Spinner,
  },
  setup() {
    const store = useStore();

    // Initial player load
    store.dispatch("fetchData");

    const playerLoading = computed(() => store.state.player.loading);
    const playerState = computed(() => store.state.player.player);

    const progress = ref(0);

    const handlePlayPause = async () => {
      if (!playerState.value?.isActive) return;

      if (playerState.value?.data.isPlaying) {
        await store.dispatch("pausePlayer");
      } else {
        await store.dispatch("startPlayer");
      }
    };

    const handleNext = async () => {
      await store.dispatch("nextPlayer");
    };

    const loadingBar = ref<HTMLDivElement | null>(null);
    let interval = 0;

    watchEffect(() => {
      if (!playerState.value?.isActive || !playerState.value.data.isPlaying) {
        clearInterval(interval);
        return;
      }

      if (interval) {
        clearInterval(interval);
      }

      interval = setInterval(() => {
        progress.value = progress.value + 1000;
      }, 1000);
    });

    watchEffect(() => {
      if (!playerState.value?.isActive) {
        return;
      }

      progress.value = playerState.value.data.progress;
    });

    watchEffect(() => {
      if (!loadingBar.value || !playerState.value?.isActive) {
        return;
      }

      const width = progress.value / playerState.value.data.track.duration;

      if (width >= 1) {
        store.dispatch("fetchData");
        clearInterval(interval);
        return;
      }

      loadingBar.value.style.width = `calc(${width * 100}% - 16px)`;
    });

    return {
      player: playerState,
      loading: playerLoading,
      loadingBar,

      handlePlayPause,
      handleNext,
    };
  },
});
</script>

<style scoped>
.player {
  display: grid;
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: 80px;
  background-color: #272727;
  border-radius: 8px;
  padding: 8px;
  grid-template-columns: auto 1fr auto;
  grid-gap: 16px;
}

.track-image {
  height: 48px;
  width: 48px;
  border-radius: 8px;
  object-fit: contain;
  align-self: center;
}

.player-icon {
  align-self: center;
  cursor: pointer;
  width: 48px;
  height: 48px;
}

.player-track {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.player-track-name {
  font-size: 20px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-artists {
  font-size: 16px;
  opacity: 0.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-icons {
  display: flex;
  justify-content: end;
  grid-column: 3/4;
  grid-row: 1;
}

.player-fade-enter-active,
.player-fade-leave-active {
  transition: transform 0.2s ease, opacity 0.5s ease;
}

.player-fade-enter-from,
.player-fade-leave-to {
  transform: translate(0, 100px);
  opacity: 0;
}

.loading-bar {
  height: 2px;
  background-color: white;
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 8px;
  right: 8px;
  transition: width 0.5s ease;
}
</style>
