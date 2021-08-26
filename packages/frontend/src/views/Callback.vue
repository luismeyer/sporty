<template>
  <div>login is loading please wait...</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { authStore } from "../stores/auth";

export default defineComponent({
  components: {},
  data() {
    return authStore.state;
  },
  async mounted() {
    const { code } = this.$route.query;

    if (!code || typeof code !== "string") {
      this.$router.push({ name: "Session" });
      return;
    }

    const token = await authStore.authorize(code);

    if (token) {
      this.$router.push({ name: "Session" });
    } else {
      this.$router.push({ name: "Login" });
    }
  },
});
</script>
