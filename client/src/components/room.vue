<template>
  <div>
    <span v-if="gameStarted">
      <b-row class="my-1">
        <b-col>
          <div class="card" style="box-shadow: rgb(39 37 37 / 60%) 1px 2px; background-color: black; width: 850px; left: 50%; transform: translate(-50%, 0%);">
            <div class="card-body">
              <b-row class="my-3">
                <b-col>
                  <h3 class="card-title" style="color: aliceblue;">
                    💣😾  𝐏เᑕ𝕋ⓘｏηคгу  💜👊
                  </h3>
                </b-col>
              </b-row>
            </div>
          </div>
        </b-col>
      </b-row>
      <b-row class="my-1" align-h="center">
        <b-col cols="2" class="">
          <div class="card text-center" style="box-shadow: rgb(39 37 37 / 60%) 1px 2px; background-color: black;" >
            <ul class="list-group list-group-flush" >
              <li v-for="(user, index) in users" :key="index" class="list-group-item d-flex justify-content-between align-items-start" style="color: white; background-color: black;">
                <div class="ms-2 me-auto">
                  <div class="fw-bold">{{user.name}}</div>
                  Score:
                </div>
                <span class=" bg-light rounded-pill" style="font-size: xx-large;">{{getUserEmojiToDisplay(user.emoji)}}</span>
              </li>
            </ul>
          </div>
        </b-col>
        <b-col cols="8">
          <div class="card" style="box-shadow: rgb(39 37 37 / 60%) 1px 2px; background-color: #000000c4; width: 850px; left: 50%; transform: translate(-59.5%, 0%);" >
            <div class="card-body">
              <b-row>
                <b-col>
                  <canvas class="board" id="myCanvas" :width="canvasSize.width" :height="canvasSize.height" @mousemove="draw" @mousedown="beginDrawing" @mouseup="stopDrawing"  />
                </b-col>
              </b-row>
            </div>
          </div>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <div class="card" style="box-shadow: rgb(39 37 37 / 60%) 1px 2px; background-color: #000000c4; width: 850px; left: 50%; transform: translate(-50%, 0%);">
            <div class="card-body" style="padding: 5px">
                <div class="row ">
                  <div class="col-2" style="color: white; padding-top: 7px;">
                    <label style="padding-right:3px">Color  </label>
                    <input v-model="colorSelected" type="color"/>
                  </div>
                  <div class="col-1">
                    <button type="button" class="btn btn-light" style="padding: 5px" :disabled="canvasSelectedTool == 'PEN'" @click="changeCanvasSelectedTool('PEN')"><img src="../assets/bootstrap-icons/icons/pencil.svg" alt="Pen" style="width: 25px"></button>
                  </div>
                  <div class="col-1">
                    <button type="button" class="btn btn-light" style="padding: 5px" :disabled="canvasSelectedTool == 'ERASER'" @click="changeCanvasSelectedTool('ERASER')"><img src="../assets/bootstrap-icons/icons/eraser.svg" alt="Eraser" style="width: 25px"></button>
                  </div>
                  <div class="col-1">
                    <button type="button" class="btn btn-light" style="padding: 5px" :disabled="canvasSelectedTool == 'FILL'" @click="changeCanvasSelectedTool('FILL')"><img src="../assets/bootstrap-icons/icons/paint-bucket.svg" alt="Paint bucket" style="width: 25px"></button>
                  </div>
                  <div class="col-1">
                    <button type="button" class="btn btn-light" style="padding: 5px"><img src="../assets/bootstrap-icons/icons/trash.svg" alt="Clear" style="width: 25px" @click="clearCanvas"></button>
                  </div>
                  <div class="col-1">
                    <b-dropdown variant="light" toggle-class="text-decoration-none" no-caret>
                      <template #button-content>
                        <span class="sr-only">Size:  </span>
                        <img src="../assets/bootstrap-icons/icons/circle-fill.svg" :alt="penSizeList[penSizeIndex].alt" :style="penSizeList[penSizeIndex].style">
                      </template>
                      <b-dropdown-item v-for="(penSize, index) in penSizeList" :key="index" :value="penSize.alt" @click="penSizeChange(index)"><img src="../assets/bootstrap-icons/icons/circle-fill.svg" :alt="penSize.alt" :style="penSize.style"></b-dropdown-item>
                    </b-dropdown>
                  </div>
                </div>
            </div>
          </div>
        </b-col>
      </b-row>
    </span>
    <span v-else>
      <span v-if="connectedToRoom" style="position: relative">
        <b-row style="width: 70rem; padding: 30px; position: absolute; left: 50%; top: 50%; transform: translate(-50%, 10%);">
          <b-col style="height: 400px">
            <div>
              <div class="card text-center" style="color: white; width: 30rem; padding: 30px; position: absolute; box-shadow: rgb(134 129 129 / 72%) 3px 5px; background-color: black;">
                <div class="card-body">
                  <b-row class="my-3">
                    <b-col>
                      <h3 class="card-title" style="color: aliceblue;">
                        ｓ𝒆Ⓣţ𝐢ŇＧ𝐒
                      </h3>
                    </b-col>
                  </b-row>
                  <b-row class="my-3">
                    <b-col>
                      Rounds ({{rounds}})
                      <select class="form-select" v-model="rounds" :disabled="!isMeAdmin()" @change="roundsChange()">
                        <option v-for="(value, index) in roundsList" :key="index" :value="value">{{value}}</option>
                      </select>
                    </b-col>
                  </b-row>
                  <b-row class="my-3">
                    <b-col>
                      Draw time in seconds ({{timeoutSec}})
                      <select class="form-select" v-model="timeoutSec" :disabled="!isMeAdmin()" @change="drawTimeChange()">
                        <option v-for="(value, index) in timeoutSecList" :key="index" :value="value">{{value}}</option>
                      </select>
                    </b-col>
                  </b-row>
                  <b-row class="my-3">
                    <b-col>
                      <b-button variant="success" @click="startGame" :disabled="!isMeAdmin()">Start</b-button>
                    </b-col>
                  </b-row>
                </div>
              </div>
            </div>
          </b-col>
          <b-col style="height: 400px">
            <div>
              <div class="card text-center" style="color: white; width: 30rem; padding: 30px; position: absolute; box-shadow: rgb(134 129 129 / 72%) 3px 5px; background-color: black;">
                <div class="card-body">
                  <b-row class="my-3">
                    <b-col>
                      <h3 class="card-title" style="color: aliceblue;">
                        𝓡ό𝕆м
                      </h3>
                    </b-col>
                  </b-row>
                  <b-row class="my-3">
                    <b-col>
                      <div class="container">
                        <div class="row row-cols-2 row-cols-lg-5 g-2 g-lg-3">
                          <div class="col" v-for="(user, index) in users" :key="index">
                            <span style="font-size: xxx-large;">{{getUserEmojiToDisplay(user.emoji)}}</span>
                            {{user.name}} {{user.isAdmin ? '(admin)' : ''}} {{user.self ? '(You)' : ''}}
                          </div>
                        </div>
                      </div>
                    </b-col>
                  </b-row>
                </div>
              </div>
            </div>
          </b-col>
        </b-row>
      </span>
      <span v-else>
        <div style="position: relative">
          <div class="card text-center" style="width: 30rem; padding: 30px; position: absolute; left: 50%; top: 50%; transform: translate(-50%, 50%);box-shadow: 5px 10px #888888;     box-shadow: rgb(134 129 129 / 72%) 3px 5px; background-color: black;" >
            <div class="card-body">
              <b-row class="my-3">
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
                  <b-button variant="success" @click="connect" :disabled="name.length < 1">Join</b-button>
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
      </span>
    </span>
  </div>
</template>

<script>
//installed components go here
import io from 'socket.io-client';

//user Defined components go here
// import Board from "@/components/board.vue";

//ordering => components, props, watch, mounted, created, method, data
export default {
  components: {
    // Board
  },
  props: [],
  watch: {},
  mounted() {},
  created() {
    let newUser = false;

    this.socket = this.getSocketFromStore();
    if(this.socket === null) {
      this.createSocketConnection();
      newUser = true;
    }

    this.initializeHandlers();
    // initialize handlers
      // connectedToRoom

    if(!newUser) {
      const roomId = this.$route.params.id;
      this.connectToRoom(roomId);
    }
  },
  methods: {
    penSizeChange(index) {
      console.log('chagne' ,index);
      console.log(this.penSizeList[index]);
      this.penSizeIndex = index;
    },
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
      this.socket = io.connect(`http://localhost:5000`);
      this.setSocketToStore(this.socket);
    },
    initializeHandlers() {
      this.socket.on('connectedToRoom', this.handleConnectedToRoom);
      this.socket.on('playerDisconected', this.handlePlayerDisconected)
      this.socket.on('playerJoined', this.handlePlayerJoined)
      this.socket.on('adminChange', this.handleAdminChange)
      this.socket.on('roundsChangeBrod', this.handleRoundsChangeBrod)
      this.socket.on('timeoutSetChangeBrod', this.handleTimeoutSetChangeBrod)
      this.socket.on('gameStarted', this.handleGameStarted)
    },
    handleConnectedToRoom(response) {
      console.log(response)

      if(response.success) {
        this.users = [...response.players];
        this.connectedToRoom = true;
      } else {
       //  toaster to show room does not exists
      }
    },
    handlePlayerDisconected(player) {
      console.log('player disconnected', player);
      this.users = this.users.filter(user => user.id !== player.id);
    },
    handlePlayerJoined(player) {
      console.log('player joined', player)
      this.users = [...this.users, player]
    },
    handleAdminChange(player) {
      for(let i = 0; i < this.users.length; i++) {
        if(this.users[i].id === player.id) {
          this.users[i].isAdmin = true;
          break;
        }
      }
    },
    handleRoundsChangeBrod(rounds) {
      this.rounds = rounds;
    },
    handleTimeoutSetChangeBrod(timeoutSec) {
      this.timeoutSec = timeoutSec;
    },
    handleGameStarted(game) {
      this.gameStarted = true;
      this.game = game;
      setTimeout(() => this.initialiseCanvas(), 1000)
    },
    connectToRoom(roomId) {
      this.socket.emit('connectToRoom', { roomId, user: this.getUserFromStore() });
    },
    connect() {
      if(this.name.length > 0) {
        const user = {
          email: '',
          name: this.name,
          emoji: this.currentEmojiIndex
        }
        this.setUserToStore(user);

        const roomId = this.$route.params.id;
        this.connectToRoom(roomId);
      }
    },
    startGame() {
      this.socket.emit('startGame', {
        rounds: this.rounds,
        timeoutSec: this.timeoutSec
      });
    },
    getUserEmojiToDisplay(index) {
      if(index < this.emojis.length) {
        return this.emojis[index];
      }

      return this.emojis[0];
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
    },
    isMeAdmin() {
      for(let i = 0; i < this.users.length; i+=1) {
        if(this.users[i].self && this.users[i].isAdmin) return true;
      }

      return false;
    },
    drawTimeChange() {
      console.log(this.timeoutSec)
      this.socket.emit('timeoutSetChange', {timeoutSec: this.timeoutSec});
    },
    roundsChange() {
      console.log(this.rounds)
      this.socket.emit('roundsChange', {rounds: this.rounds});
    },
    initialiseCanvas() {
      let c = document.getElementById('myCanvas');
      this.canvas = c.getContext('2d');
      this.canvas.fillStyle = '#ffffff';
      this.canvas.fillRect(0, 0, this.canvasSize.width, this.canvasSize.height);
    },
    showCoordinates(e) {
      this.x = e.offsetX;
      this.y = e.offsetY;
    },
    drawLine(x1, y1, x2, y2, color) {
      let ctx = this.canvas;
      ctx.beginPath();
      ctx.strokeStyle = color;  //this.colorSelected ? this.colorSelected : 'black';
      ctx.lineWidth = this.penSizeIndex ? this.penSizeList[this.penSizeIndex].size : 1;
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.closePath();
    },
    draw(e) {
      if(this.isDrawing) {
        let color = this.colorSelected ? this.colorSelected : 'black';

        if(this.canvasSelectedTool === 'ERASER')  color = '#ffffff';

        this.drawLine(this.x, this.y, e.offsetX, e.offsetY, color);
        this.x = e.offsetX;
        this.y = e.offsetY;
      }
    },
    beginDrawing(e) {
      if(this.canvasSelectedTool === 'PEN' || this.canvasSelectedTool === 'ERASER') {
        this.x = e.offsetX;
        this.y = e.offsetY;
        this.isDrawing = true;
      } else if(this.canvasSelectedTool === 'FILL') {
        this.fillColor(this.colorSelected);
      }
    },
    stopDrawing(e) {
      if (this.isDrawing) {
        let color = this.colorSelected ? this.colorSelected : 'black';

        if(this.canvasSelectedTool === 'ERASER')  color = '#ffffff';

        this.drawLine(this.x, this.y, e.offsetX, e.offsetY, color);
        this.x = 0;
        this.y = 0;
        this.isDrawing = false;
      }
    },
    clearCanvas() {
      console.log('clearing')
      this.canvas.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);
    },
    fillColor(color) {
      console.log('filling', color);
      this.canvas.fillStyle = color;
      this.canvas.fillRect(0, 0, this.canvasSize.width, this.canvasSize.height);
    },
    changeCanvasSelectedTool(tool) {
      this.canvasSelectedTool = tool;
    }
  },
  data() {
    return {
      socket: null,
      connectedToRoom: false,
      users: [],
      name: '',
      roundsList: [2, 3, 4, 5, 6, 7, 8, 9, 10],
      rounds: 2,
      timeoutSecList: [60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180],
      timeoutSec: 90,
      emojis: ['🐣', '😾', '👺', '🐻', '😡', '🐤', '🐼', '😳', '🐑', '👽', '🐰', '💀', '🎃', '🐙', '😲', '😂', '😍', '🥳', '🥵', '🤡','💩', '😭', '🤪', '🥺', '😘'],
      currentEmojiIndex: 0,
      gameStarted: false,
      game: undefined,
      canvas: null,
      canvasSize: {
        width: 800,
        height: 600
      },
      x:0,
      y:0,
      isDrawing: false,
      colorSelected: '#000000',
      penLineWidth: 1,
      penSizeList: [
        {
          style: 'width: 5px;',
          iconSrc: '../assets/bootstrap-icons/icons/circle-fill.svg',
          alt: 1,
          size: 3
        },{
          style: 'width: 10px;',
          iconSrc: '../assets/bootstrap-icons/icons/circle-fill.svg',
          alt: 2,
          size: 8
        },{
          style: 'width: 15px;',
          iconSrc: '../assets/bootstrap-icons/icons/circle-fill.svg',
          alt: 3,
          size: 13
        },{
          style: 'width: 20px;',
          iconSrc: '../assets/bootstrap-icons/icons/circle-fill.svg',
          alt: 4,
          size: 17
        },{
          style: 'width: 25px;',
          iconSrc: '../assets/bootstrap-icons/icons/circle-fill.svg',
          alt: 5,
          size: 22
        }
      ],
      penSizeIndex: 0,
      canvasSelectedTool: 'PEN',  // PEN, ERASER, FILL
    }
  },
}
</script>

<style scoped>
  .board {
    background-color: white;
    box-shadow: rgb(134 129 129 / 72%) 2px 3px;
  }

  .sketch {
    width: 50rem;
    height: 40rem;
  }
</style>
