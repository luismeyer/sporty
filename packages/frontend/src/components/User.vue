<template>
  <li>
    <img :src="user.image" alt="User profile image" />

    <div class="body">
      <div class="user">
        <span>{{ user.name }}</span>

        <svg
          v-if="user.isPlayer"
          fill="white"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            d="M16 21c3.527-1.547 5.999-4.909 5.999-9S19.527 4.547 16 3v2c2.387 1.386 3.999 4.047 3.999 7S18.387 17.614 16 19v2z"
          />
          <path
            d="M16 7v10c1.225-1.1 2-3.229 2-5s-.775-3.9-2-5zM4 17h2.697l5.748 3.832a1.004 1.004 0 0 0 1.027.05A1 1 0 0 0 14 20V4a1 1 0 0 0-1.554-.832L6.697 7H4c-1.103 0-2 .897-2 2v6c0 1.103.897 2 2 2zm0-8h3c.033 0 .061-.016.093-.019a1.027 1.027 0 0 0 .38-.116c.026-.015.057-.017.082-.033L12 5.868v12.264l-4.445-2.964c-.025-.017-.056-.02-.082-.033a.986.986 0 0 0-.382-.116C7.059 15.016 7.032 15 7 15H4V9z"
          />
        </svg>
      </div>

      <span
        >User has <b>{{ user.tracksInQueue }}</b> Song{{
          user.tracksInQueue === 1 ? "" : "s"
        }}
        in the Queue</span
      >
    </div>

    <svg
      class="crown"
      v-if="user.isOwner"
      fill="white"
      width="32"
      height="32"
      viewBox="0 0 24 24"
    >
      <path
        d="M11.219 3.375 8 7.399 4.781 3.375A1.002 1.002 0 0 0 3 4v15c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V4a1.002 1.002 0 0 0-1.781-.625L16 7.399l-3.219-4.024c-.381-.474-1.181-.474-1.562 0zM5 19v-2h14.001v2H5zm10.219-9.375c.381.475 1.182.475 1.563 0L19 6.851 19.001 15H5V6.851l2.219 2.774c.381.475 1.182.475 1.563 0L12 5.601l3.219 4.024z"
      />
    </svg>
  </li>
</template>

<script lang="ts">
import { FrontendUser } from "@sporty/api";
import { defineComponent, PropType } from "vue";

export default defineComponent({
  props: {
    user: Object as PropType<FrontendUser>,
  },
});
</script>

<style scoped>
img {
  width: 60px;
  height: 60px;
  object-fit: cover;
}

li {
  width: 100%;
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: auto 1fr auto;
  grid-gap: 12px;
}

.user {
  display: grid;
  grid-template-columns: auto 1fr;
  font-size: 20px;
  align-items: center;
  grid-gap: 8px;
}

.body {
  display: grid;
  align-items: center;
  font-size: 14px;
}

.crown {
  align-self: center;
}
</style>
