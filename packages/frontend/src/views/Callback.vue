<template>
  <div class="container">
    <h1>login is loading...</h1>
  </div>
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
