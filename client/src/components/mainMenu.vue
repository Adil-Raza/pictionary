
<template>
  <div style="position: relative">
    <div class="card text-center" style="width: 30rem; padding: 30px; position: absolute; left: 50%; top: 50%; transform: translate(-50%, 50%); box-shadow: rgb(134 129 129 / 72%) 3px 5px; background-color: black;" >
      <div class="card-body">
        <b-row class="">
          <b-col>
            <h3 class="card-title" style="color: aliceblue;">
              💣😾  𝐏เᑕ𝕋ⓘｏηคгу  💜👊
            </h3>
          </b-col>
        </b-row>
        <b-row class="my-3">
          <b-col>
            <b-form-input v-model="name" placeholder="Enter your name"></b-form-input>
          </b-col>
        </b-row>
        <b-row class="my-3">
          <b-col>
            <b-row>
              <b-col> <span type="button" @click="prevEmoji()" style="font-size: xxx-large;">⬅️ </span></b-col>
              <b-col><span style="font-size: xxx-large;">{{getUserEmoji()}}</span></b-col>
              <b-col><span type="button" @click="nextEmoji()" style="font-size: xxx-large;">➡️</span></b-col>
            </b-row>
          </b-col>
        </b-row>
        <b-row class="my-3">
          <b-col>
            <br />
            <b-button variant="success" @click="createPrivateRoom" :disabled="name.length < 1">Create Private Room</b-button>
          </b-col>
        </b-row>
        <br />
        <div class="card-footer text-muted" style="background-color: black; font-size: smaller;">
          How to play: <br />
          When its your turn to draw, you will have to choose a word from three options and visualize that word in 80 seconds, alternatively when somebody else is drawing you have to type your guess into the chat to gain points, be quick, the earlier you guess a word the more points you get!
        </div>
      </div>
    </div>
  </div>
</template>

<script>
//installed components go here
import io from 'socket.io-client';

//user Defined components go here

//ordering => components, props, watch, mounted, created, method, data
export default {
  components: {},
  props: [],
  watch: {},
  mounted() {},
  created() {},
  methods: {
    getSocketFromStore() {
      return this.$store.state.socket;
    },
    setSocketToStore(socket) {
      this.$store.commit('setSocket', socket);
    },
    setUserToStore(user) {
      this.$store.commit('setUser', user);
    },
    getUserFromStore() {
      return this.$store.state.user;
    },
    createSocketConnection() {
      var socket = io.connect(`http://localhost:5000`);
      this.setSocketToStore(socket);
      this.initialiseHandlers();
    },
    createPrivateRoom() {
      if(this.name.length > 0) {
        this.createSocketConnection();

        let socket = this.getSocketFromStore();

        const user = {
          email: '',
          name: this.name,
          emoji: this.currentEmojiIndex
        };

        this.setUserToStore(user);

        socket && socket.emit('createPvtRoom', user);
      }
    },
    initialiseHandlers() {
      let socket = this.getSocketFromStore();
      socket && socket.on('pvtRoomCreated', this.handlePrivateRoomCreated);
    },
    handlePrivateRoomCreated(data) {
      this.$router.push({ name: 'room', params: { id: data.id }})
    },
    getUserEmoji() {
      return this.emojis[this.currentEmojiIndex];
    },
    prevEmoji() {
      if(this.currentEmojiIndex == 0) {
        this.currentEmojiIndex = this.emojis.length - 1;
      } else {
        this.currentEmojiIndex = this.currentEmojiIndex - 1;
      }
    },
    nextEmoji() {
      this.currentEmojiIndex = (this.currentEmojiIndex + 1) % this.emojis.length;
    }
  },
  data() {
    return {
      email: '',
      name: '',
      socket: undefined,
      emojis: ['🐣', '😾', '👺', '🐻', '😡', '🐤', '🐼', '😳', '🐑', '👽', '🐰', '💀', '🎃', '🐙', '😲', '😂', '😍', '🥳', '🥵', '🤡','💩', '😭', '🤪', '🥺', '😘'],
      currentEmojiIndex: 0
    }
  },
}
</script>

<style scoped>

</style>
