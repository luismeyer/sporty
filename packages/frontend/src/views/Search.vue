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
      <Spinner class="loading" size="40" :spinning="loading" color="black" />
    </div>

    <img v-if="searchResults.length === 0" src="../assets/search.png" />

    <ul>
      <Track
        v-for="track in searchResults"
        :key="track.id"
        :track="track"
        :action="add"
        icon-name="add"
      />
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watchEffect } from "vue";
import { useRouter } from "vue-router";

import { Track as TrackType } from "@qify/api";

import Track from "../components/Track.vue";
import Spinner from "../components/Spinner.vue";

import { useFetchSearch } from "../hooks/use-fetch-search";
import { useState } from "../store";
import { useStore } from "vuex";

export default defineComponent({
  components: {
    Spinner,
    Track,
  },

  setup() {
    const { auth } = useState();
    const store = useStore();

    const router = useRouter();

    if (!auth.isAuthenticated) {
      router.push({ name: "Login" });
      return;
    }

    const searchResults = ref([] as TrackType[]);
    const queryInput = ref<HTMLInputElement>();
    const query = ref("");

    const { loading, fetchSearch } = useFetchSearch(query, searchResults);

    watchEffect(() => {
      const { value } = query;

      if (value.length <= 3) {
        return;
      }

      const length = query.value.length;

      setTimeout(async () => {
        if (loading.value || length !== value.length) {
          return;
        }

        fetchSearch();
      }, 500);
    });

    onMounted(() => {
      const input = queryInput.value;
      input?.focus();
    });

    return {
      query,
      loading,
      searchResults,
      queryInput,
      handleSubmit: () => !loading.value && fetchSearch(),
      add: (id: string) => store.dispatch("addSongToQueue", id),
    };
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
