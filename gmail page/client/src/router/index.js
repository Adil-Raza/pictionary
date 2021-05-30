import Vue from "vue";
import VueRouter from "vue-router";
import SignIn from "../views/SignIn.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/o/oauth2/identifier",
    name: "signin",
    component: SignIn,
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
