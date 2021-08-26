<template>
  <div>joining session</div>
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
