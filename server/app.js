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


const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server, { cors: {origin: '*'} });
const { v4: uuidv4 } = require('uuid');

io.on('connection', (socket) => {
  console.log('User Connected: ', socket.id);

  socket.on('createPvtRoom', (data) => {
    console.log(`Private room Creation request from user: ${socket.id}, and data: ${data.name}`);

    const roomId = uuidv4(); //12345; // this will be generated using uuid

    // later store more details of user, like email for unique identification
    const player = {
      id: 1,
      socket: socket,
      name: data.name,
      emoji: data.emoji,
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
            isAdmin: player.isAdmin,
            connectedToRoom: player.connectedToRoom,
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
        isAdmin: playerInfo.isAdmin,
        connectedToRoom: playerInfo.connectedToRoom
      }
      response.players = players;

      socket.emit('connectedToRoom', response);

      // brodcast to all other users that this player is joined
      rooms[roomId].players.forEach(player => {
        if(player.socket.id !== socket.id && player.connectedToRoom) {
          console.log(`--broadcasting to ${player.id}`);
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
          timoutSec: data.timeoutSec,
          rounds: data.rounds,
          currentRound: 0,
          state: 'PENDING'
        }

        // broadcasting all players that game started
        let response = {
          boardState: rooms[roomId].game.boardState,
          timoutSec: rooms[roomId].game.timeoutSec,
          rounds: rooms[roomId].game.rounds,
          currentRound: 0,
          state: 'PENDING'
        }

        rooms[roomId].players.forEach(player => {
          player.socket.emit('gameStarted', response);
        })
      }
    }
  })

  // when user disconnects
  socket.on('disconnect', () => {
    const roomId = socketIdToRoomId[socket.id];

    if(rooms[roomId]){
      let playerInfo = rooms[roomId].players.filter(player => player.socket.id == socket.id);

      if(playerInfo && playerInfo.length > 0) {
        playerInfo[0].connectedToRoom = false;

        // broadcast to all players in roomId
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
