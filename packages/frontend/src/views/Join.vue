<template>
  <div class="container">
    <h1>joining session...</h1>
  </div>
</template>

<script lang="ts">
import { defineComponent, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";

import { store, useStore } from "../store";

export default defineComponent({
  setup() {
    const { state } = useStore();

    const router = useRouter();
    const route = useRoute();

    if (!state.auth.isAuthenticated) {
      router.push({ name: "Login" });
      return;
    }

    const { session } = route.query;

    if (!session) {
      router.push({ name: "Session" });
      return;
    }

    watchEffect(() => {
      if (!state.session.session) {
        return;
      }

      router.push({ name: "Session" });
    });

    store.dispatch("joinSession", session);
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
