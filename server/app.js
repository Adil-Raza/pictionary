// // installed
// const express = require('express')

// // user defined
// const userRoute = require('./routes/user')

// config
const {
  PORT
} =  require('./appConfig/config')

// // initializing app
// const app = express()

// // setting routes
// app.use('/user', userRoute)


// // error route
// app.all('*', (req, res) => {
//   res.status(400).send('Unknown URL')
// })


// app.listen(PORT, () => {
//   console.log(`server is listening on port ${PORT}...`)
// })

let rooms = {};

let socketIdToRoomId = {}

const wordList = ['train', 'haircut', 'strange', 'sweet', 'deliver', 'cart', 'agony','vigorous', 'secure', 'mountain', 'prospect'];


const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server, { cors: {origin: '*'} });
const { v4: uuidv4 } = require('uuid');
const _ = require('lodash');

io.on('connection', (socket) => {
  console.log('User Connected: ', socket.id);

  socket.on('createPvtRoom', (data) => {
    console.log(`Private room Creation request from user: ${socket.id}, and data: ${data.name}`);

    const roomId = uuidv4();

    // later store more details of user, like email for unique identification
    const player = {
      id: 1,
      socket: socket,
      name: data.name,
      emoji: data.emoji,
      email: data.email,
      score: 0,
      hasGuessed: false,
      isAdmin: true,
      connectedToRoom: false
    };

    rooms[roomId] = {
      players: [player]
    }

    socketIdToRoomId[socket.id] = roomId;

    socket.emit('pvtRoomCreated', {id: roomId});
  })

  socket.on('connectToRoom', data => {
    const user = data.user;
    const roomId = data.roomId;

    let response = {}

    if(rooms[roomId]){
      let playerInfo = rooms[roomId].players.filter(player => player.name === user.name); // change to email

      if(playerInfo && playerInfo.length > 0) {
        // existing user in player list
        console.log('existing user');

        playerInfo[0].connectedToRoom = true;
        playerInfo[0].socket = socket;
        playerInfo[0].name = user.name;
        playerInfo[0].emoji = user.emoji;
        playerInfo = playerInfo[0];
      } else {
        // new user
        console.log('new user');

        const id = rooms[roomId].players.length + 1;

        playerInfo = {
          id: id,
          socket: socket,
          name: user.name,
          emoji: user.emoji,
          email: data.email,
          score: 0,
          hasGuessed: false,
          isAdmin: false,
          connectedToRoom: true
        };

        rooms[roomId].players = [...rooms[roomId].players, playerInfo];
        socketIdToRoomId[socket.id] = roomId;
      }

      // creating existing player list to send to just user
      let players = [];
      rooms[roomId].players.forEach(player => {
        if(player.connectedToRoom){
          players.push({
            id: player.id,
            name: player.name,
            emoji: player.emoji,
            score: player.score,
            hasGuessed: player.hasGuessed,
            isAdmin: player.isAdmin,
            self: (socket.id === player.socket.id ? true : false)
          })
        }
      })

      response.success = true;
      response.message = 'Room joined';
      response.player = {
        id: playerInfo.id,
        name: playerInfo.name,
        emoji: playerInfo.emoji,
        score: playerInfo.score,
        hasGuessed: playerInfo.hasGuessed,
        isAdmin: playerInfo.isAdmin,
        self: (socket.id === playerInfo.socket.id ? true : false)
      }
      response.players = players;

      // check if game has started, if yes, send the game object also so that it will redirect directly to game screen
      console.log('player joined', roomId, rooms[roomId].game);
      if(rooms[roomId].game) {
        // change the response to send only nessesary info
        response.game = rooms[roomId].game;
      }

      socket.emit('connectedToRoom', response);

      // brodcast to all other users that this player is joined
      rooms[roomId].players.forEach(player => {
        if(player.socket.id !== socket.id && player.connectedToRoom) {
          player.socket.emit('playerJoined', response.player);
        }
      })
    } else {
      response.success = false;
      response.message = 'Room does not exist';

      socket.emit('connectedToRoom', response);
    }


    console.log('------------------------------------------')
  })

  socket.on('roundsChange', (data) => {
    const roomId = socketIdToRoomId[socket.id];

    if(roomId && rooms[roomId]) {
      rooms[roomId].game.rounds = data.rounds;

      rooms[roomId].players.forEach(player => {
        if(player.connectedToRoom && player.socket.id != socket.id) {
          player.socket.emit('roundsChangeBrod', data.rounds);
        }
      })
    }
  })

  socket.on('timeoutSetChange', (data) => {
    const roomId = socketIdToRoomId[socket.id];

    if(roomId && rooms[roomId]) {
      rooms[roomId].game.timeoutSec = data.timeoutSec;

      rooms[roomId].players.forEach(player => {
        if(player.connectedToRoom && player.socket.id != socket.id) {
          player.socket.emit('timeoutSetChangeBrod', data.timeoutSec);
        }
      })
    }
  })

  socket.on('startGame', (data) => {
    // only admin
    const roomId = socketIdToRoomId[socket.id];

    if(rooms[roomId]){
      let playerInfo = rooms[roomId].players.filter(player => player.socket.id == socket.id);

      if(playerInfo && playerInfo.length > 0 && playerInfo[0].isAdmin) {
        console.log('starting game');

        rooms[roomId].game = {
          boardState: null,
          timeoutSec: data.timeoutSec,
          rounds: data.rounds,
          currentRound: 0,
          state: 'PENDING',
          whoHasAlreadyChoosen: [],  // contains ids of person who has already choosen word for this round
          whoChoosing: -1,
          whoDrawing: -1,
          currentWord: '',
          hintWord: ''
        }

        // broadcasting all players that game started
        let response = {
          boardState: rooms[roomId].game.boardState,
          timeoutSec: rooms[roomId].game.timeoutSec,
          rounds: rooms[roomId].game.rounds,
          currentRound: rooms[roomId].game.currentRound,
          state: rooms[roomId].game.state
        }

        rooms[roomId].players.forEach(player => {
          player.socket.emit('gameStarted', response);
        })

        // start round 1, and brod to every player

        startRound(roomId, 1);

        rooms[roomId].game.currentRound = 1;
        rooms[roomId].game.state = 'CHOOSING';

        // choosing a plyaer in sequence who will choose a word, and who is connected and has not choosen a word till now
        let whoChoosing = -1;
        for(let i = 0; i < rooms[roomId].players.length; i+=1) {
          if(rooms[roomId].players[i].connectedToRoom && !rooms[roomId].game.whoHasAlreadyChoosen.includes(rooms[roomId].players[i].id)) {
            whoChoosing = rooms[roomId].players[i].id;
            break;
          }
        }

        if(whoChoosing != -1) {
          rooms[roomId].game.whoChoosing = whoChoosing;

          // randomly selecting 3 word for user to select
          let words = _.sampleSize(wordList, 3);

          let response = {
            currentRound: rooms[roomId].game.currentRound,
            state: rooms[roomId].game.state,
            whoChoosing: rooms[roomId].game.whoChoosing  // player id who is choosing the word
          }
          rooms[roomId].players.forEach(player => {
            if(player.id === rooms[roomId].game.whoChoosing) {
              // append 3 words to player who is choosing word
              response.words = words;
            }

            player.socket.emit('gameRoundBrod', response);
          })
        } else {
          rooms[roomId].game.whoChoosing = -1;
          // brod round end, as all the connected users have selected the word
          rooms[roomId].game.state = 'ROUNDEND';

          // TODO: send players new score ranking
          response = {
            game: { state: rooms[roomId].game.state }
          }

          rooms[roomId].players.forEach(player => {
            player.socket.emit('lobbyEndBrod', response);
          })
        }
      }
    }
  })

  socket.on('wordSelected', (data) => {
    const roomId = socketIdToRoomId[socket.id];

    const word = data;

    if(rooms[roomId]){
      let playerInfo = rooms[roomId].players.filter(player => player.socket.id == socket.id);

      if(playerInfo && playerInfo.length > 0 && playerInfo[0].id === rooms[roomId].game.whoChoosing) {
        rooms[roomId].game.currentWord = word;
        rooms[roomId].game.hintWord = '_'.repeat(rooms[roomId].game.currentWord.length);

        rooms[roomId].game.whoHasAlreadyChoosen.push(playerInfo[0].id);
        rooms[roomId].game.state = 'GUESSING';
        rooms[roomId].game.whoChoosing = -1;
        rooms[roomId].game.whoDrawing = playerInfo[0].id;

        rooms[roomId].game.timerInterval = setInterval(() => {
          rooms[roomId].game.timeoutSec -= 1;
          if(rooms[roomId].game.timeoutSec <= 0) {
            clearInterval(rooms[roomId].game.timerInterval);
            // TODO: check if all connected players have selected word then
            let hasAllPlayersSelectedWord = true;

            for(let i = 0; i < rooms[roomId].players.length; i += 1) {
              if(rooms[roomId].players[i].connectedToRoom && !rooms[roomId].game.whoHasAlreadyChoosen.includes(rooms[roomId].players[i].id)) {
                hasAllPlayersSelectedWord = false;
              }
            }

            let response = {};

            if(hasAllPlayersSelectedWord) {
              rooms[roomId].game.state = 'ROUNDEND';

              // TODO: send players new score ranking
              response = {
                game: { state: rooms[roomId].game.state }
              }

              rooms[roomId].players.forEach(player => {
                player.socket.emit('lobbyEndBrod', response);
              })
            } else {
              rooms[roomId].game.state = 'TIMEOUT';

              // TODO: send players new score ranking
              response = {
                game: { state: rooms[roomId].game.state }
              }

              rooms[roomId].players.forEach(player => {
                player.socket.emit('lobbyEndBrod', response);
              })

              setTimeout(() => {
                // next player needs to select word
                // choosing a plyaer in sequence who will choose a word, and who is connected and has not choosen a word till now
                let whoChoosing = -1;
                for(let i = 0; i < rooms[roomId].players.length; i+=1) {
                  if(rooms[roomId].players[i].connectedToRoom && !rooms[roomId].game.whoHasAlreadyChoosen.includes(rooms[roomId].players[i].id)) {
                    whoChoosing = rooms[roomId].players[i].id;
                    break;
                  }
                }

                if(whoChoosing != -1) {
                  rooms[roomId].game.whoChoosing = whoChoosing;

                  rooms[roomId].game.state = 'CHOOSING';

                  // randomly selecting 3 word for user to select
                  let words = _.sampleSize(wordList, 3);

                  let response = {
                    currentRound: rooms[roomId].game.currentRound,
                    state: rooms[roomId].game.state,
                    whoChoosing: rooms[roomId].game.whoChoosing  // player id who is choosing the word
                  }
                  rooms[roomId].players.forEach(player => {
                    if(player.id === rooms[roomId].game.whoChoosing) {
                      // append 3 words to player who is choosing word
                      response.words = words;
                    }

                    player.socket.emit('gameRoundBrod', response);
                  })
                }
              }, 5000);
            }
          }
        }, 1000);

        let response = {
          currentRound: rooms[roomId].game.currentRound,
          state: rooms[roomId].game.state,
          whoDrawing: rooms[roomId].game.whoDrawing
        }

        // brodcast that word is choosen so the game starts
        rooms[roomId].players.forEach(player => {
          if(player.id === rooms[roomId].game.whoChoosing) {
            // append word if this player is choosing the word
            response.currentWord = rooms[roomId].game.currentWord;
          } else {
            // append hint word to players who needs to guess
            response.currentWord = rooms[roomId].game.hintWord;
          }

          player.socket.emit('wordSelectedBrod', response);
        })
      }
    }
  })

  socket.on('boardChange', (data) => {
    const roomId = socketIdToRoomId[socket.id];

    let boardState = data.boardState;

    if(rooms[roomId] && rooms[roomId].game && boardState) {
      rooms[roomId].game.boardState = boardState;

      // broadcast to everyone except me
      rooms[roomId].players.forEach(player => {
        if(player.connectedToRoom && player.socket.id != socket.id) {
          player.socket.emit('boardChangeBrod', {
            boardState: rooms[roomId].game.boardState
          });
        }
      })
    }
  })

  socket.on('chat', (data) => {
    const roomId = socketIdToRoomId[socket.id];

    const message = data;

    if(roomId && rooms[roomId]) {
      const playerInfo = rooms[roomId].players.filter(player => player.socket.id == socket.id);

      rooms[roomId].players.forEach(player => {
        player.socket.emit('chatBrod', {
          id: playerInfo[0].id,
          msg: message
        });
      })
    }
  })

  // when user disconnects
  socket.on('disconnect', () => {
    const roomId = socketIdToRoomId[socket.id];

    if(rooms[roomId]){
      let playerInfo = rooms[roomId].players.filter(player => player.socket.id == socket.id);

      if(playerInfo && playerInfo.length > 0) {
        playerInfo[0].connectedToRoom = false;

        // broadcast to all players in roomId with playerid that is disconnected
        rooms[roomId].players.forEach(player => {
          if(socket.id !== player.socket.id && player.connectedToRoom){
            console.log(`--broadcasting to ${player.id}`);
            player.socket.emit('playerDisconected', {
              id: playerInfo[0].id
            });
          }
        })

        // change admin if admin disconnected
        if(playerInfo[0].isAdmin) {
          for(let i = 0; i < rooms[roomId].players.length; i += 1) {
            if(rooms[roomId].players[i].connectedToRoom) {
              rooms[roomId].players[i].isAdmin = true;

              // broadcas all for => admin changed
              rooms[roomId].players.forEach(player => {
                if(socket.id !== player.socket.id && player.connectedToRoom){
                  console.log(`--broadcasting admin to ${player.id}`);
                  player.socket.emit('adminChange', {
                    id: rooms[roomId].players[i].id
                  });
                }
              })

              playerInfo[0].isAdmin = false;

              break;
            }
          }
        }

        // remove sockettoroom mapping
        delete socketIdToRoomId[socket.id];
      }
    }
    console.log('disconnected: ', socket.id);
  })
})

const startRound = (roomId, round) => {
  console.log('round start from function')
}


// let uers = [];

// const messages = {
//   general: [],
//   random: [],
//   jokes: [],
//   javascript: []
// };

// io.on('connection', socket => {
//   socket.on('join server', username => {
//     const user =  {
//       username,
//       id: socket.id,
//     };

//     users.push(user);
//     io.emit('new user', users);
//   })


//   socket.on('join room', (roomName, cb) => {  //cb = callback which client passes
//     socket.join(roomName);
//     cb(messages[roomName]); // this will call the client callback function, with the messages
//     // socket.emit('joined', messages[roomName]);   // this could also be done instead of ablve line, but then you need to write listner in client side for 'joined' emit
//   })

//   socket.on('send message', ({ content, to, sender, chatName, isChanel }) => {
//     if(isChanel) {
//       const payload = {
//         content,
//         chatName,
//         sender,
//       };

//       socket.to(to).emit('new message', payload);
//     } else {
//       const payload = {
//         content,
//         chatName: sender,
//         sender
//       }

//       socket.to(to).emit('new message', payload);
//     }
//   })


//   socket.on('disconnect', () => {
//     users = users.filter(u => u.id !== socket.id);
//     io.emit('new user', users);
//   })
// })


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
});
