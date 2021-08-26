<template>
  <div>
    <div class="headline">
      <h1>Session Settings</h1>
      <router-link to="/"> Back </router-link>
    </div>

    <span v-if="loading">loading...</span>

    <div v-else>
      <div class="setting">
        <label>Leave session</label>
        <button v-if="sessionState.session" class="leave" @click="handleLeave">
          leave
        </button>
      </div>

      <div class="share">
        <img :src="sessionState.session.qrCode" alt="QR code to join" />
        <a :href="sessionState.session.url">share me</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { authStore } from "../stores/auth";
import { sessionStore } from "../stores/session";

export default defineComponent({
  data() {
    return {
      sessionState: sessionStore.state,
      authState: authStore.state,
      loading: !sessionStore.state.hasData,
    };
  },
  async mounted() {
    if (!this.authState.isAuthenticated) {
      this.$router.push({ name: "Login" });
    }

    if (!this.sessionState.hasData) {
      await sessionStore.fetch();
    }

    this.loading = false;
  },
  methods: {
    async handleLeave() {
      this.loading = true;
      await sessionStore.leave();

      this.$router.push({ name: "Session" });
    },
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

.setting {
  display: grid;
}

img {
  width: 100%;
}

.share {
  width: 60%;
  margin: 64px auto 0;
}
</style>
