<template>
  <div class="container">
    <h1>joining session...</h1>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { authStore } from "../stores/auth";
import { sessionStore } from "../stores/session";

export default defineComponent({
  components: {},
  data() {
    return {
      authState: authStore.state,
      sessionState: sessionStore.state,
    };
  },
  async mounted() {
    if (!this.authState.isAuthenticated) {
      this.$router.push({ name: "Login" });
      return;
    }

    const { session } = this.$route.query;

    if (!session || typeof session !== "string") {
      this.$router.push({ name: "Session" });
      return;
    }

    await sessionStore.join(session);

    this.$router.push({ name: "Session" });
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
