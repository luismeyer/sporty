<template>
  <div class="container">
    <h1>login is loading...</h1>
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

    const { code } = route.query;

    if (!code) {
      router.push({ name: "Session" });
      return;
    } else {
      store.dispatch("authorize", code);
    }

    watchEffect(() => {
      if (state.auth.isAuthenticated) {
        router.push({ name: "Session" });
      } else {
        router.push({ name: "Login" });
      }
    });
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
