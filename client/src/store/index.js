import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    socket: null,
    user: {
      email: '',
      name: '',
      emoji: 0
    }
  },
  mutations: {
    setSocket(state, socket) {
      state.socket = socket;
    },
    setUser(state, user) {
      state.user = user;
    }
  },
  actions: {},
  modules: {},
});
