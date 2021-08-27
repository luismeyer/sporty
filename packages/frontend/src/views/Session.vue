<template>
  <div>
    <Reload :disabled="sessionState.loading" :onClick="refresh" />

    <div class="headline">
      <h1>Session</h1>
      <div class="links" v-if="!loading && sessionState.session">
        <router-link class="link" to="/settings"> Settings </router-link>
        <router-link class="link" to="/share"> Share with friends </router-link>
      </div>
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
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import User from "../components/User.vue";

import { SessionStore, sessionStore } from "../stores/session";
import { authStore } from "../stores/auth";
import Reload from "../components/Reload.vue";

export default defineComponent({
  components: {
    User,
    Reload,
  },

  data() {
    return {
      sessionState: sessionStore.state,
      authState: authStore.state,
    };
  },

  computed: {
    loading(): boolean {
      const state = this.sessionState as SessionStore["state"];
      return !state.session && state.loading;
    },
  },

  methods: {
    async handleCreate() {
      await sessionStore.create();
    },

    async handleLeave() {
      await sessionStore.leave();
    },

    async refresh() {
      await sessionStore.fetch();
    },
  },

  async mounted() {
    if (!this.authState.isAuthenticated) {
      this.$router.push({ name: "Login" });
    }

    await sessionStore.fetch();
  },
});
</script>

<style scoped>
h1 {
  text-align: center;
  margin-bottom: 8px;
}

.headline {
  display: grid;
  justify-content: center;
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
  grid-gap: 24px;
  justify-items: start;
  padding: 0;
  list-style: none;
}

.links {
  display: grid;
  grid-auto-flow: column;
  grid-gap: 24px;
}
</style>
