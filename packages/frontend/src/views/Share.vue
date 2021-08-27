<template>
  <div>
    <div class="headline">
      <h1>Share this Session</h1>
      <router-link to="/"> Back </router-link>
    </div>

    <span v-if="loading">loading...</span>

    <div v-else class="share">
      <img :src="sessionState.session.qrCode" alt="QR code to join" />
      <a :href="sessionState.session.url">share this link with your friends</a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { authStore } from "../stores/auth";
import { SessionStore, sessionStore } from "../stores/session";

export default defineComponent({
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
  margin-bottom: 0;
}

.headline {
  display: grid;
  align-items: center;
  justify-items: center;
  margin-bottom: 16px;
}

img {
  width: 100%;
}

.share {
  width: 80%;
  margin: 64px auto 0;
}
</style>
