<template>
  <div>
    <h1>Your Q</h1>

    <div v-if="loading">loading...</div>
    <ul v-else>
      <Track
        :track="track"
        :key="track.id"
        v-for="track in queueState.queue"
        v-bind:action="remove"
        icon-name="remove"
      />
    </ul>

    <Fab :disabled="refreshLoading || loading" :onClick="refreshQueue" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { authStore } from "../stores/auth";
import { queueStore } from "../stores/queue";

import Track from "../components/Track.vue";
import Fab from "../components/Fab.vue";

export default defineComponent({
  components: {
    Track,
    Fab,
  },
  data() {
    return {
      authState: authStore.state,
      queueState: queueStore.state,
      loading: !queueStore.state.queue,
      refreshLoading: false,
    };
  },
  methods: {
    async remove(id: string) {
      await queueStore.removeSong(id);
    },
    async refreshQueue() {
      this.refreshLoading = true;
      await queueStore.fetch();
      this.refreshLoading = false;
    },
  },
  async mounted() {
    if (!this.authState.isAuthenticated) {
      this.$router.push({ name: "Login" });
    }

    await this.refreshQueue();

    this.loading = false;
  },
});
</script>

<style scoped>
h1 {
  text-align: center;
}

ul {
  display: grid;
  grid-gap: 12px;
  justify-items: start;
  padding: 0;
  list-style: none;
}
</style>
