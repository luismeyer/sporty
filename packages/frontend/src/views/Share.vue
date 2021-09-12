<template>
  <div>
    <div class="headline">
      <h1>Share this Session</h1>
      <router-link to="/"> Back </router-link>
    </div>

    <span v-if="loading">loading...</span>

    <div v-else class="share">
      <img :src="sessionState.session.qrCode" alt="QR code to join" />
      <span @click="copyLink" class="link">
        share this link with your friends
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";

import { useState, useStore } from "../store";

export default defineComponent({
  setup() {
    const { session } = useState();
    const store = useStore();

    store.dispatch("fetchData");

    const copyLink = () => {
      if (!session.session) {
        return;
      }

      const el = document.createElement("textarea");
      el.value = session.session.url;
      el.setAttribute("readonly", "");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      const selected =
        document.getSelection()?.rangeCount ?? 0 > 0
          ? document.getSelection()?.getRangeAt(0)
          : false;
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      if (selected) {
        document.getSelection()?.removeAllRanges();
        document.getSelection()?.addRange(selected);
      }
    };

    return {
      copyLink,
      sessionState: computed(() => session),
      loading: computed(() => session.loading && !session.session),
    };
  },
});
</script>

<style scoped>
h1 {
  text-align: center;
  margin-bottom: 0;
}

.headline {
  display: grid;
  align-items: center;
  justify-items: center;
  margin-bottom: 16px;
}

img {
  width: 100%;
}

.share {
  width: 80%;
  margin: 64px auto 0;
}

.link {
  color: #2efff5;
  text-decoration: underline;
  cursor: pointer;
}
</style>
