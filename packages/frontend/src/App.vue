<template>
  <div>
    <router-view />
    <Footer />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import Footer from "./components/Footer.vue";

export default defineComponent({
  components: {
    Footer,
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: white;
}

a {
  color: #2efff5;
}

html {
  background: linear-gradient(#2b2b2b, black) no-repeat fixed;
}

h1 {
  margin: 16px 0;
}

* {
  box-sizing: border-box;
}
</style>
