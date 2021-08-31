<template>
  <div class="container">
    <h1>login is loading...</h1>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useStore } from "../store";

export default defineComponent({
  setup() {
    const store = useStore();

    const router = useRouter();
    const route = useRoute();

    onMounted(() => {
      const { code } = route.query;

      if (!code) {
        router.push({ name: "Session" });
        return;
      } else {
        store.dispatch("authorize", code);
      }
    });

    const isAuthenticated = computed(() => store.state.user.isAuthenticated);

    watch(isAuthenticated, (newVal, oldVal) => {
      if (newVal === oldVal) {
        return;
      }

      if (newVal) {
        router.push({ name: "Session" });
        return;
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
