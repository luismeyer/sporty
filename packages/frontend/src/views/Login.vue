<template>
  <div class="about">
    <h1>Login</h1>
    <button @click="login">Login</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { authStore } from "../stores/auth";

export default defineComponent({
  methods: {
    async login() {
      const url = await authStore.login();
      window.open(url, "_self");
    },
  },
});
</script>
