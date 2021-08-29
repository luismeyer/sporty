<template>
  <div class="reload" @click="handleLoad">
    <Spinner :spinning="loading || additionalLoading" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import Spinner from "./Spinner.vue";

const SPINNER_HEIGHT = 64;

export default defineComponent({
  components: {
    Spinner,
  },

  props: {
    reload: {
      required: true,
      type: Function as PropType<() => Promise<void>>,
    },
    additionalLoading: Boolean,
  },

  data() {
    return {
      loading: false,
      timer: 0,
    };
  },

  async mounted() {
    this.scrollTop();

    await this.handleLoad();

    if (!this.additionalLoading) {
      console.log("SCROLL");
      window.scrollTo({ top: SPINNER_HEIGHT, behavior: "smooth" });
    }

    window.addEventListener("beforeunload", this.scrollTop);

    window.addEventListener("scroll", this.handleScroll);
  },

  unmounted() {
    window.removeEventListener("beforeunload", this.scrollTop);

    window.removeEventListener("scroll", this.handleScroll);
  },

  methods: {
    scrollTop() {
      window.scrollTo({ top: 0 });
    },

    async handleLoad() {
      this.loading = true;
      await this.reload();
      this.loading = false;
    },

    async handleScroll() {
      if (this.timer !== null) {
        clearTimeout(this.timer);
      }

      this.timer = setTimeout(async () => {
        if (window.scrollY <= SPINNER_HEIGHT && window.scrollY > 0) {
          window.scrollTo({ top: SPINNER_HEIGHT, behavior: "smooth" });
          return;
        }

        if (window.scrollY !== 0) {
          return;
        }

        this.loading = true;
        await this.reload();
        this.loading = false;

        window.scrollTo({ top: SPINNER_HEIGHT, behavior: "smooth" });
      }, 150);
    },
  },
});
</script>

<style>
.reload {
  background-color: #00d953;
  border: none;
  outline: none;
  padding: 16px 16px 18px 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  width: 100vw;

  margin-left: -24px;
  margin-top: -16px;
}

.container-with-reloader {
  /* Height is calculated by the Reload-bar height and the Footer-height */
  height: calc(100vh + 64px - 70px);
  scroll-snap-type: y mandatory;
}
</style>
