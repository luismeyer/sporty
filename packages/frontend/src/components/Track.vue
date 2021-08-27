<template>
  <li
    @click="handleClick"
    class="track"
    v-bind:class="[{ addLoading: loading }]"
  >
    <img
      class="song-image"
      :src="track.image.url"
      alt="Spotify Preview Image"
    />
    <div class="info">
      <div class="caption">
        <span class="name">{{ track.name }}</span>
        <img
          class="user-image"
          v-if="user"
          :src="user.image"
          alt="User profile image"
        />
      </div>
      <span class="artists">{{ track.artists.join(", ") }}</span>
    </div>

    <div class="action">
      <button v-if="action" @click="handleClick">
        <svg
          v-if="iconName === 'remove'"
          fill="white"
          width="32"
          height="32"
          viewBox="0 0 24 24"
        >
          <path d="M21.063 15H13v2h9v-2zM4 7h11v2H4zm0 4h11v2H4zm0 4h7v2H4z" />
        </svg>

        <svg
          v-if="iconName === 'add'"
          fill="white"
          width="32"
          height="32"
          viewBox="0 0 24 24"
        >
          <path
            d="M19 15v-3h-2v3h-3v2h3v3h2v-3h3v-2h-.937zM4 7h11v2H4zm0 4h11v2H4zm0 4h8v2H4z"
          />
        </svg>
      </button>
    </div>
  </li>
</template>

<script lang="ts">
import { FrontendUser, Track } from "@qify/api";
import { defineComponent, PropType } from "vue";

type ActionType = (id: string) => Promise<void>;

export default defineComponent({
  props: {
    track: Object as PropType<Track>,
    user: Object as PropType<FrontendUser>,
    iconName: String as PropType<"add" | "remove">,
    action: Function as PropType<ActionType>,
  },
  data() {
    return {
      loading: false,
    };
  },
  methods: {
    async handleClick() {
      if (!this.action || !this.track) {
        return;
      }

      this.loading = true;
      await this.action(this.track.id);
      this.loading = false;
    },
  },
});
</script>

<style scoped>
.track {
  display: grid;
  justify-items: start;
  grid-template-columns: auto 1fr auto;
  grid-gap: 12px;
  border-radius: 8px;
  color: white;
  transition: opacity 0.2s ease;
  width: 100%;
}

.info {
  display: flex;
  flex-direction: column;
}

.artists {
  font-size: 14px;
}

.action {
  justify-self: end;
}

.name {
  font-size: 20px;
  font-weight: bold;
}

button {
  height: 100%;
  background: none;
  border: none;
}

.song-image {
  width: 60px;
}

.caption {
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr;
  width: 100%;
  grid-gap: 12px;
}

.user-image {
  width: 20px;
  height: 20px;
  object-fit: cover;
  border-radius: 50%;
}

.addLoading {
  opacity: 0.5;
}
</style>
