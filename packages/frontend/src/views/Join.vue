<template>
  <div class="container">
    <h1>joining session...</h1>
  </div>
</template>

<script lang="ts">
import { defineComponent, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useState, useStore } from "../store";

export default defineComponent({
  setup() {
    const { session } = useState();
    const store = useStore();

    const router = useRouter();
    const route = useRoute();

    const { session: sessionId } = route.query;

    if (!sessionId) {
      router.push({ name: "Session" });
      return;
    }

    watchEffect(() => {
      if (!session.session) {
        return;
      }

      router.push({ name: "Session" });
    });

    store.dispatch("joinSession", sessionId);
  },
});
</script>

<style scoped>
.container {
  position: absolute;
  margin: auto;
  left: 0;
  top: 40%;
  text-align: center;
  width: 100%;
  padding: 0 12px;
}
</style>
