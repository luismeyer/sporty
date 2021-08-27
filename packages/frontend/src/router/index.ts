import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

import Session from "../views/Session.vue";
import Settings from "../views/Settings.vue";
import Queue from "../views/Queue.vue";
import Login from "../views/Login.vue";
import Callback from "../views/Callback.vue";
import Search from "../views/Search.vue";
import Join from "../views/Join.vue";
import Share from "../views/Share.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Session",
    component: Session,
  },
  {
    path: "/settings",
    name: "Settings",
    component: Settings,
  },
  {
    path: "/share",
    name: "Share",
    component: Share,
  },
  {
    path: "/queue",
    name: "Queue",
    component: Queue,
  },
  {
    path: "/search",
    name: "Search",
    component: Search,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/callback",
    name: "Callback",
    component: Callback,
  },
  {
    path: "/join",
    name: "Join",
    component: Join,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
