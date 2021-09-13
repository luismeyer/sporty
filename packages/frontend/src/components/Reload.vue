<template>
  <div class="reload">
    <Spinner :spinning="true" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  onUnmounted,
  PropType,
  toRef,
  watch,
} from "vue";
import { useStore } from "../store";

import Spinner from "./Spinner.vue";

const SPINNER_HEIGHT = 64;

export default defineComponent({
  components: {
    Spinner,
  },

  props: {
    loading: {
      required: true,
      type: Boolean,
    },
  },

  setup(props) {
    const store = useStore();
    let timer: number | undefined;

    const scrollTop = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const scrollToContent = () => {
      window.scrollTo({ top: SPINNER_HEIGHT, behavior: "smooth" });
    };

    const handleScroll = async () => {
      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(async () => {
        if (window.scrollY <= SPINNER_HEIGHT && window.scrollY > 0) {
          scrollToContent();
          return;
        }

        if (!loading.value && window.scrollY === 0) {
          store.dispatch("fetchData");
        }
      }, 500);
    };

    onMounted(async () => {
      scrollTop();

      window.addEventListener("beforeunload", scrollTop);

      window.addEventListener("scroll", handleScroll, false);
    });

    onUnmounted(() => {
      window.removeEventListener("beforeunload", scrollTop);

      window.removeEventListener("scroll", handleScroll);
    });

    const loading = toRef(props, "loading");

    watch(loading, (newState, oldState) => {
      if (newState === oldState) {
        return;
      }

      if (newState) {
        scrollTop();
        return;
      }

      scrollToContent();
    });
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
  height: calc(100vh + 64px);
  scroll-snap-type: y mandatory;
}
</style>
