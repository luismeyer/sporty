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

      <div v-if="user" class="setting">
        <label>Toggle your Spotify player</label>
        <input
          type="checkbox"
          :checked="user.isPlayer"
          @change="toggleIsPlayer"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { useRouter } from "vue-router";

import { store, useState } from "../store";

export default defineComponent({
  setup() {
    const { user } = useState();
    const router = useRouter();

    store.dispatch("fetchData");

    const leaving = ref(false);

    return {
      leaving,
      user: computed(() => user.user),
      loading: computed(() => user.loading && !user.user),

      toggleIsPlayer: () => store.dispatch("toggleIsPlayer"),
      async handleLeave() {
        leaving.value = true;
        await store.dispatch("leaveSession");
        router.push({ name: "Session" });
      },
    };
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
