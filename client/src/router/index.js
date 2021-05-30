import Vue from "vue";
import VueRouter from "vue-router";
// import Home from "../views/Home.vue";
import MainMenu from "../views/mainMenu.vue";
import Login from "../views/login.vue";
import Room from "../views/room.vue";
import Callback from "../views/Callback.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    redirect: {
      name: 'login'
    }
  },{
    path: "/login",
    name: "login",
    component: Login,
  },{
    path: "/menu",
    name: "mainmenu",
    component: MainMenu,
  },{
    path: "/room/:id",
    name: "room",
    component: Room,
  },{
    path: "/callback",
    name: "callback",
    component: Callback,
  },{
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
