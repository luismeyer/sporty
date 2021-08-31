<template>
  <div class="about">
    <h1>Login</h1>
    <button @click="login">Login</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, watchEffect } from "vue";

import { useStore } from "../store";

export default defineComponent({
  setup() {
    const store = useStore();

    watchEffect(() => {
      const { loginUrl } = store.state.user;

      if (!loginUrl) {
        return;
      }

      window.open(loginUrl, "_self");
    });

    return {
      login: () => store.dispatch("login"),
    };
  },
});
</script>
