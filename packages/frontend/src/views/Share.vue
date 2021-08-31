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
import { computed, defineComponent } from "vue";

import { useState, useStore } from "../store";

export default defineComponent({
  setup() {
    const { session } = useState();
    const store = useStore();

    store.dispatch("fetchSession");

    return {
      sessionState: computed(() => session),
      loading: computed(() => session.loading && !session.session),
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

img {
  width: 100%;
}

.share {
  width: 80%;
  margin: 64px auto 0;
}
</style>
