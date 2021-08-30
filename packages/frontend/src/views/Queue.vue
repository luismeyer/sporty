<template>
  <div class="container-with-reloader">
    <Reload :load="refreshQueue" :loading="loading" />

    <h1>Your Queue</h1>

    <div v-if="initialLoading || queueState.queue?.length === 0" class="empty">
      <span>
        is {{ initialLoading ? "loading..." : "empty... add something" }}
      </span>
      <img src="../assets/queue.png" />
    </div>

    <ul v-else>
      <Track
        v-for="track in queueState.queue"
        :key="track.id"
        :track="track.track"
        :action="user.name === track.user.name ? remove : undefined"
        :user="track.user"
        icon-name="remove"
      />
    </ul>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useRouter } from "vue-router";

import { useState, useStore } from "../store";

import Track from "../components/Track.vue";
import Reload from "../components/Reload.vue";

export default defineComponent({
  components: {
    Track,
    Reload,
  },

  setup() {
    const { queue, user, auth } = useState();
    const store = useStore();

    const router = useRouter();

    if (!auth.isAuthenticated) {
      router.push({ name: "Login" });
      return;
    }

    store.dispatch("fetchUser");

    return {
      queueState: computed(() => queue),
      user: computed(() => user.user),
      loading: computed(() => queue.loading || user.loading),
      initialLoading: computed(
        () => (queue.loading && !queue.queue) || (user.loading && !user.user)
      ),

      remove: (id: string) => store.dispatch("removeSongFromQueue", id),
      refreshQueue: () => store.dispatch("fetchQueue"),
    };
  },
});
</script>

<style scoped>
.container {
  display: grid;
  justify-items: center;
}

h1 {
  text-align: center;
  margin-top: 16px;
}

ul {
  display: grid;
  grid-gap: 24px;
  justify-items: start;
  padding: 0;
  list-style: none;
  padding: 0 0 80px;
}

img {
  max-width: 100%;
}

.empty {
  display: grid;
  justify-items: center;
}

.spinner {
  margin: 0 auto;
}
</style>
