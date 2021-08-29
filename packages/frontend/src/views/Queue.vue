<template>
  <div class="container-with-reloader">
    <Reload :reload="refreshQueue" v-bind:additionalLoading="loading" />

    <h1>Your Queue</h1>

    <div v-if="loading || queueState.queue?.length === 0" class="empty">
      <span>is {{ loading ? "loading..." : "empty... add something" }} </span>
      <img src="../assets/queue.png" />
    </div>

    <ul v-else>
      <Track
        v-for="item in queueState.queue"
        :action="userState.user.name === item.user.name ? remove : undefined"
        :track="item.track"
        :user="item.user"
        :key="item.id"
        icon-name="remove"
      />
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { authStore } from "../stores/auth";
import { QueueStore, queueStore } from "../stores/queue";
import { UserStore, userStore } from "../stores/user";

import Track from "../components/Track.vue";
import Reload from "../components/Reload.vue";

export default defineComponent({
  components: {
    Track,
    Reload,
  },

  data() {
    return {
      queueState: queueStore.state,
      userState: userStore.state,
    };
  },

  computed: {
    loading() {
      const queueState = this.queueState as QueueStore["state"];
      const userState = this.userState as UserStore["state"];

      return !queueState.queue || (userState.loading && !userState.user);
    },
  },

  methods: {
    async remove(id: string) {
      await queueStore.removeSong(id);
    },

    async refreshQueue() {
      await queueStore.fetch();
    },
  },

  async mounted() {
    if (!authStore.state.isAuthenticated) {
      this.$router.push({ name: "Login" });
    }

    await userStore.fetch();
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
