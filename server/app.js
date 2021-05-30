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

let socketIdToRoomId = {};

const DRWAINGPLAYERSCORE = 30;
const FIRSTRANKSCORE = 400;
const SECONDRANKSCORE = 300;
const SUBSEQUENTSCOREDROP = 25;

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
      players: [player],
      game: {
        state: 'ROOM'
      }
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
        isAdmin: playerInfo.isAdmin
      }
      response.players = players;

      // check if game has started, if yes, send the game object also so that it will redirect directly to game screen
      // console.log('player joined', roomId, rooms[roomId].game);
      if(rooms[roomId].game.state != 'ROOM') {
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
        rooms[roomId].game.whoDrawing = playerInfo[0].id;

        startClockTimer(roomId)

        let response = {
          currentRound: rooms[roomId].game.currentRound,
          state: rooms[roomId].game.state,
          whoDrawing: rooms[roomId].game.whoDrawing
        }

        console.log('selecting word', rooms[roomId].game);
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

        rooms[roomId].game.whoChoosing = -1;
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

      if(playerInfo[0].id != rooms[roomId].game.whoDrawing && !playerInfo[0].hasGuessed) {
        if(didGuessMatch(roomId, message)) {
          playerInfo[0].subRoundScore = getSubRoundScore(roomId);
          playerInfo[0].hasGuessed = true;

          addScoreToDrawingPlayer(roomId);

          // brod that player this guessed
          rooms[roomId].players.forEach(player => {
            if(player.id !== playerInfo[0].id) {
              player.socket.emit('playerGuessed', {
                id: playerInfo[0].id
              })
            } else {
              player.socket.emit('chatBrod', {
                id: playerInfo[0].id,
                msg: message,
                color: '#3e6346'
              });
            }
          })
        } else {
          rooms[roomId].players.forEach(player => {
            player.socket.emit('chatBrod', {
              id: playerInfo[0].id,
              msg: message
            });
          })
        }
      } else {
        // brod to only players those have guessed, and send msg with green color
        rooms[roomId].players.forEach(player => {
          (player.hasGuessed || player.id === rooms[roomId].game.whoDrawing) &&
          player.socket.emit('chatBrod', {
            id: playerInfo[0].id,
            msg: message,
            color: '#3e6346'
          });
        })
      }

      printPlayers(roomId);

      if(allPlayersGuessed(roomId)) {
        clearInterval(rooms[roomId].game.timerInterval);
        sendTimeOut(roomId);

        setTimeout(() => {
          // next player needs to select word if any left
          refereshPlayer(roomId);
          startWordSelection(roomId);
        }, 5000);
      }
    }
  })

  socket.on('clearCanvas', () => {
    const roomId = socketIdToRoomId[socket.id];

    sendClearCanvas(roomId);
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
            // console.log(`--broadcasting to ${player.id}`);
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
  rooms[roomId].game.currentRound = round;
  rooms[roomId].game.whoChoosing = -1;
  rooms[roomId].game.state.whoDrawing = -1;
  rooms[roomId].game.whoHasAlreadyChoosen = [];

  refereshPlayer(roomId);

  startWordSelection(roomId);
}

const startWordSelection = (roomId) => {
  refereshPlayer(roomId);
  sendClearCanvas(roomId);

  rooms[roomId].game.state = 'CHOOSING';
  rooms[roomId].game.state.whoDrawing = -1;
  rooms[roomId].game.whoChoosing = -1;

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

    sendRoundEnd(roomId);
  }
}

const sendRoundEnd = (roomId) => {
  // brod round end, as all the connected users have selected the word
  rooms[roomId].game.state = 'ROUNDEND';

  // TODO: send players new score ranking as round ended
  let response = {
    game: { state: rooms[roomId].game.state }
  }

  rooms[roomId].players.forEach(player => {
    player.socket.emit('lobbyEndBrod', response);
  })

  setTimeout(() => {
    if(rooms[roomId].game.currentRound < rooms[roomId].game.rounds) {
      startRound(roomId, rooms[roomId].game.currentRound + 1);
    } else {
      console.log('game over');
      sendGameEnd(roomId);
    }
  }, 5000)
}

const sendTimeOut = (roomId) => {
  rooms[roomId].game.state = 'TIMEOUT';

  let scores = getPlayersSubRoundScore(roomId);

  let response = {
    game: { state: rooms[roomId].game.state },
    scores : scores,
    word: rooms[roomId].game.currentWord
  }

  rooms[roomId].players.forEach(player => {
    player.socket.emit('lobbyEndBrod', response);
  })
}

const startClockTimer = (roomId) => {
  rooms[roomId].game.timer = rooms[roomId].game.timeoutSec; // setting timer for counter;

  rooms[roomId].game.timerInterval = setInterval(() => {
    rooms[roomId].game.timer -= 1; // decreasing time every second

    if(rooms[roomId].game.timer <= 0) {
      clearInterval(rooms[roomId].game.timerInterval);

      let hasAllPlayersSelectedWord = true;

      for(let i = 0; i < rooms[roomId].players.length; i += 1) {
        if(rooms[roomId].players[i].connectedToRoom && !rooms[roomId].game.whoHasAlreadyChoosen.includes(rooms[roomId].players[i].id)) {
          hasAllPlayersSelectedWord = false;
          break;
        }
      }

      if(hasAllPlayersSelectedWord) {
        sendRoundEnd(roomId);
      } else {
        sendTimeOut(roomId);
        setTimeout(() => {
          refereshPlayer(roomId);
          // next player needs to select word if any left
          startWordSelection(roomId);
        }, 5000);
      }
    }
  }, 1000);
}

const didGuessMatch = (roomId, message) => {
  const currentWord = rooms[roomId].game.currentWord;

  return currentWord.toLowerCase() === message.toLowerCase();
}

const allPlayersGuessed = (roomId) => {
  let allGuessed = true;

  rooms[roomId].players.forEach(player => {
    if(player.id !== rooms[roomId].game.whoDrawing && !player.hasGuessed) {
      allGuessed = false;
    }
  })

  return allGuessed;
}

const refereshPlayer = (roomId) => {
  rooms[roomId].players.forEach(player => {
    player.score += (player.subRoundScore ? player.subRoundScore : 0);
    player.hasGuessed = false;
    player.subRoundScore = 0;
  })

  // brod to referesh the players
  rooms[roomId].players.forEach(player => {
    player.socket.emit('refereshPlayer', '');
  })
}

const getPlayersSubRoundScore = (roomId) => {
  let scores = {};

  rooms[roomId].players.forEach(player => {
    if(player.connectedToRoom) {
      scores[player.id] = player.subRoundScore;
    }
  })

  return scores;
}

const getSubRoundScore = (roomId) => {
  let guessedIndex = 1;

  rooms[roomId].players.forEach(player => {
    if(player.id !== rooms[roomId].game.whoDrawing && player.hasGuessed) {
      guessedIndex += 1;
    }
  })


  console.log('guessedIndex: ', guessedIndex);

  if(guessedIndex == 1){
    return FIRSTRANKSCORE;
  } else {
    let score = (SECONDRANKSCORE - ((guessedIndex - 2) * SUBSEQUENTSCOREDROP));
    return score < 100 ? 100 : score;
  }
}

const addScoreToDrawingPlayer = (roomId) => {
  const drawingPlayerId = rooms[roomId].game.whoDrawing;

  rooms[roomId].players.forEach(player => {
    if(player.id === drawingPlayerId) {
      player.subRoundScore += DRWAINGPLAYERSCORE;
    }
  })
}

const sendGameEnd = (roomId) => {
  rooms[roomId].game.state = 'GAMEEND';

  rooms[roomId].players.forEach(player => {
    if(player.connectedToRoom)
      player.socket.emit('gameEnd');
  })

  setTimeout(() => {
    sendGoToRoom(roomId);
  }, 10000)
}

const sendClearCanvas = (roomId) => {
  rooms[roomId].players.forEach(player => {
    if(player.connectedToRoom) {
      player.socket.emit('clearCanvasBrod');
    }
  })
}

const sendGoToRoom = (roomId) => {
  rooms[roomId].game.state = 'ROOM';

  rooms[roomId].players.forEach(player => {
    player.score = 0;
    if(player.connectedToRoom)
      player.socket.emit('gotoRoom');
  })
}



const printPlayers = (roomId) => {
  let players = [];

  rooms[roomId].players.forEach((player) => {
    players.push( {
      id: player.id,
      name: player.name,
      hasGuessed: player.hasGuessed
    })
  })
  console.log('players', players);
}


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
});
