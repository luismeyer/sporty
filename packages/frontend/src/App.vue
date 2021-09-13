<template>
  <div>
    <router-view />
    <Player />
    <Footer />
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  watchEffect,
} from "vue";
import { useRoute, useRouter } from "vue-router";

import Footer from "./components/Footer.vue";
import Player from "./components/Player.vue";
import { useStore } from "./store";

export default defineComponent({
  components: {
    Footer,
    Player,
  },

  setup() {
    const store = useStore();

    const router = useRouter();
    const route = useRoute();

    const userState = computed(() => store.state.user);

    const handleResize = () => {
      document.body.style.height = window.innerHeight + "px";
    };

    onMounted(() => {
      // Ensure the user token is correct

      if (userState.value.isAuthenticated) {
        store.dispatch("fetchData");
      }

      window.addEventListener("resize", handleResize);

      handleResize();
    });

    onUnmounted(() => {
      window.removeEventListener("resize", handleResize);
    });

    const unauthRoutes = ["Login", "Callback"];

    watchEffect(() => {
      if (userState.value.loading || !route.name) {
        return;
      }

      const isUnauthRoute = unauthRoutes.includes(route.name.toString());

      if (!userState.value.isAuthenticated && !isUnauthRoute) {
        router.push({ name: "Login" });
        return;
      }

      if (userState.value.isAuthenticated && isUnauthRoute) {
        router.push({ name: "Session" });
        return;
      }
    });
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: white;
  padding: 16px 24px 0px;
}

body {
  margin: 0;
}

a {
  color: #2efff5;
}

html {
  background: linear-gradient(#2b2b2b, black) no-repeat fixed;
}

h1 {
  margin: 0 0 16px 0;
}

* {
  box-sizing: border-box;
}
</style>
