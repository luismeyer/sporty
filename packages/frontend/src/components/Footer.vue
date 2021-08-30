<template>
  <div v-if="isAuthenticated" class="footer-container">
    <router-link v-slot="{ isActive }" class="link" to="/">
      <svg fill="white" width="24" height="24" viewBox="0 0 24 24">
        <path
          d="M16.604 11.048a5.67 5.67 0 0 0 .751-3.44c-.179-1.784-1.175-3.361-2.803-4.44l-1.105 1.666c1.119.742 1.8 1.799 1.918 2.974a3.693 3.693 0 0 1-1.072 2.986l-1.192 1.192 1.618.475C18.951 13.701 19 17.957 19 18h2c0-1.789-.956-5.285-4.396-6.952z"
        />
        <path
          d="M9.5 12c2.206 0 4-1.794 4-4s-1.794-4-4-4-4 1.794-4 4 1.794 4 4 4zm0-6c1.103 0 2 .897 2 2s-.897 2-2 2-2-.897-2-2 .897-2 2-2zm1.5 7H8c-3.309 0-6 2.691-6 6v1h2v-1c0-2.206 1.794-4 4-4h3c2.206 0 4 1.794 4 4v1h2v-1c0-3.309-2.691-6-6-6z"
        />
      </svg>
      <span :class="{ active: isActive }">Session</span>
    </router-link>

    <router-link v-slot="{ isActive }" class="link" to="/queue">
      <svg fill="white" width="24" height="24" viewBox="0 0 24 24">
        <path
          d="m19.684 5.821-9-3.272A1.998 1.998 0 0 0 8 4.428v6.129A3.953 3.953 0 0 0 6 10c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4V4.428L19 7.7v6.856A3.962 3.962 0 0 0 17 14c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4V7.7c0-.838-.529-1.594-1.316-1.879zM6 16c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2zm11 4c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2z"
        />
      </svg>
      <span :class="{ active: isActive }">Queue</span>
    </router-link>

    <router-link v-slot="{ isActive }" class="link" to="/search">
      <svg fill="white" width="24" height="24" viewBox="0 0 24 24">
        <path
          d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z"
        />
      </svg>
      <span :class="{ active: isActive }">Search</span>
    </router-link>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useState } from "../store";

export default defineComponent({
  setup() {
    const state = useState();

    return {
      isAuthenticated: computed(() => state.auth.isAuthenticated),
    };
  },
});
</script>

<style scoped>
.footer-container {
  width: 100vw;
  padding: 16px 0px;
  position: fixed;
  bottom: 0;
  left: 0;
  display: flex;
  font-size: 16px;
  background: linear-gradient(0deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%);
}

.link {
  color: white;
  text-decoration: none;
  display: grid;
  justify-items: center;
  width: 50%;
}

.active {
  font-weight: bold;
}
</style>
