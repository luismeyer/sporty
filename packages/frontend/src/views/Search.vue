<template>
  <div>
    <h1>Search</h1>

    <div class="input">
      <input
        @keyup.enter="handleSubmit"
        ref="queryInput"
        v-model="query"
        type="text"
        placeholder="Spotify input"
      />
      <Spinner class="loading" size="40" :spinning="isLoading" color="black" />
    </div>

    <img v-if="searchResults.length === 0" src="../assets/search.png" />

    <ul>
      <li v-for="track in searchResults" :key="track.id">
        <Track :track="track" v-bind:action="add" icon-name="add" />
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { SearchResponse, Track as TrackType } from "@qify/api";

import { authStore } from "../stores/auth";
import { queueStore } from "../stores/queue";

import Track from "../components/Track.vue";
import Spinner from "../components/Spinner.vue";

import { fetchApi } from "../api";

export default defineComponent({
  components: {
    Spinner,
    Track,
  },

  data() {
    return {
      auth: authStore.state,
      query: "",
      searchResults: [] as TrackType[],
      isLoading: false,
    };
  },

  mounted() {
    if (!this.auth.isAuthenticated) {
      this.$router.push({ name: "Login" });
    }

    const input = this.$refs.queryInput as InstanceType<
      typeof HTMLInputElement
    >;

    input.focus();
  },

  watch: {
    async query() {
      if (this.query.length <= 3) {
        return;
      }

      const length = this.query.length;

      setTimeout(async () => {
        if (length !== this.query.length || this.isLoading) {
          return;
        }

        await this.fetchSearch();
      }, 1000);
    },
  },

  methods: {
    async handleSubmit() {
      if (this.isLoading) {
        return;
      }

      await this.fetchSearch();
    },

    async add(id: string) {
      await queueStore.addSong(id);
    },

    async fetchSearch() {
      this.isLoading = true;
      const result = await fetchApi<SearchResponse>(
        "search",
        `query=${this.query}`
      );

      if (result.success) {
        this.searchResults = result.body.tracks;
      }

      this.isLoading = false;
    },
  },
});
</script>

<style scoped>
img {
  max-width: 100%;
}

.input {
  position: relative;
}

.loading {
  position: absolute;
  right: 8px;
  top: 6px;
  color: black;
}

h1 {
  text-align: center;
}

input {
  width: 100%;
  padding: 10px;
  font-size: 24px;
}

ul {
  list-style: none;
  margin-bottom: 0;
  padding: 0;
  display: grid;
  grid-gap: 24px;
}
</style>
