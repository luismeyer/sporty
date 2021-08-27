<template>
  <div>
    <div class="headline">
      <h1>Session Settings</h1>
      <router-link to="/"> Back </router-link>
    </div>

    <span v-if="loading || leaving">loading...</span>

    <div class="settings" v-else>
      <div class="setting">
        <label>Leave session</label>
        <button class="leave" @click="handleLeave">leave</button>
      </div>

      <div class="setting">
        <label>Toggle your Spotify player</label>
        <input
          type="checkbox"
          :checked="userState.user?.isPlayer"
          @change="toggleIsPlayer"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { authStore } from "../stores/auth";
import { sessionStore } from "../stores/session";
import { UserStore, userStore } from "../stores/user";

export default defineComponent({
  data() {
    return {
      userState: userStore.state,
      leaving: false,
    };
  },

  computed: {
    loading(): boolean {
      const userState = this.userState as UserStore["state"];

      return !userState.user && userState.loading;
    },
  },

  async mounted() {
    if (!authStore.state.isAuthenticated) {
      this.$router.push({ name: "Login" });
    }

    await Promise.all([sessionStore.fetch(), userStore.fetch()]);
  },

  methods: {
    async handleLeave() {
      this.leaving = true;

      await sessionStore.leave();

      this.$router.push({ name: "Session" });
    },
    async toggleIsPlayer() {
      await userStore.toggleIsPlayer();
    },
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

.settings {
  display: grid;
  grid-gap: 12px;
}

.setting {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 24px;
}
</style>
