<template>
  <div>
    <div class="headline">
      <h1>Session</h1>
      <router-link
        class="link"
        to="/settings"
        v-if="!loading && sessionState.session"
      >
        Settings
      </router-link>
    </div>

    <span v-if="loading">loading...</span>

    <div v-if="!loading && sessionState.session">
      <ul>
        <User
          v-for="user in sessionState.session.users"
          v-bind:key="user.name"
          :user="user"
        />
      </ul>
    </div>

    <button
      v-if="!loading && !sessionState.session"
      class="create"
      @click="handleCreate"
    >
      Create Session
    </button>

    <Fab :disabled="loading || refreshLoading" :onClick="refreshSession" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { sessionStore } from "../stores/session";

import Fab from "../components/Fab.vue";
import User from "../components/User.vue";
import { authStore } from "../stores/auth";

export default defineComponent({
  components: {
    Fab,
    User,
  },
  data() {
    return {
      sessionState: sessionStore.state,
      authState: authStore.state,
      loading: !sessionStore.state.hasData,
      refreshLoading: false,
    };
  },
  methods: {
    async handleCreate() {
      this.loading = true;
      await sessionStore.create();
      this.loading = false;
    },
    async refreshSession() {
      this.refreshLoading = true;
      await sessionStore.fetch();
      this.refreshLoading = false;
    },
    async handleLeave() {
      this.loading = true;
      await sessionStore.leave();
      this.loading = false;
    },
  },
  async mounted() {
    if (!this.authState.isAuthenticated) {
      this.$router.push({ name: "Login" });
    }

    await this.refreshSession();

    this.loading = false;
  },
});
</script>

<style scoped>
h1 {
  text-align: center;
  margin-bottom: 0;
}

a {
  color: blue;
}

.headline {
  display: grid;
  align-items: center;
  justify-items: center;
  margin-bottom: 16px;
}

.create {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 24px;
}

ul {
  display: grid;
  grid-gap: 12px;
  justify-items: start;
  padding: 0;
  list-style: none;
}
</style>
