<template>
  <div>
    <Reload :disabled="refreshLoading || loading" :onClick="refreshQueue" />

    <h1>Your Q</h1>

    <div v-if="loading">loading...</div>

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

import Track from "../components/Track.vue";
import Reload from "../components/Reload.vue";
import { UserStore, userStore } from "../stores/user";

export default defineComponent({
  components: {
    Track,
    Reload,
  },

  data() {
    return {
      queueState: queueStore.state,
      userState: userStore.state,
      refreshLoading: false,
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
      this.refreshLoading = true;
      await queueStore.fetch();
      this.refreshLoading = false;
    },
  },

  async mounted() {
    if (!authStore.state.isAuthenticated) {
      this.$router.push({ name: "Login" });
    }

    await Promise.all([this.refreshQueue(), userStore.fetch()]);
  },
});
</script>

<style scoped>
h1 {
  text-align: center;
}

ul {
  display: grid;
  grid-gap: 24px;
  justify-items: start;
  padding: 0;
  list-style: none;
}
</style>
