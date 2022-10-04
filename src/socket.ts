import * as http from 'http'
import {Server} from 'socket.io'
import { useSocketServer } from 'socket-controllers'

// Generate Room ID  
function uuidv4() {  
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {  
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);  
      return v.toString(16);  
  });  
}  

export default (httpServer: http.Server) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*"
    }
  })

  const sockets: 
  { [index: string]: {
    name: string,
    did: string,
    is_playing: boolean,
    room_id: string | null
  } }= {}; // stores all the connected clients  
  const rooms: { [index: string]: {
    player1: string,  
    player2: string,  
    whose_turn: string,
  } } = {}; // stores the ongoing conversations


  io.on('connect', socket => {
    console.log("New socket", socket.id)
    socket.emit('connected', {"id": socket.id })

    //Register
    socket.on('checkDetail', data => {
      const flag = Object.keys(sockets).some(x => x == data.did)
      if (!flag) {  
        sockets[data.id] = {
            did: data.did,  
            is_playing: false,  
            name: `Matcher-${Object.keys(sockets).length + 1}`,
            room_id: null  
        }
      }  
      socket.emit('checkUserDetailResponse', !flag); 
    } 
    )

    //Chat list
    socket.on('getOpponents', (data: {
      did: string
    }) => {  
      const response = Object.keys(sockets).map((id,i) => {
        if (sockets[id].did !== data.did && !sockets[id].is_playing) {  
          return {
              id: id,
              name: sockets[id].name,
              did: sockets[id].did
          }  
        }  
      }) 
      socket.emit('getOpponentsResponse', response);  
      socket.broadcast.emit('newOpponentAdded', {  
          id: socket.id,
          did: sockets[socket.id].did, 
          name: sockets[socket.id].name
      });  
    });

    //Select matcher
    socket.on('selectOpponent', (data:{id: string}) => {  
      let response = { status: false, message: "Matcher is matching with someone else." }
      if (!sockets[data.id].is_playing) {  
        var roomId = uuidv4();  
        sockets[data.id].is_playing = true;  
        sockets[socket.id].is_playing = true;  
        sockets[data.id].room_id = roomId;  
        sockets[socket.id].room_id = roomId;  

        rooms[roomId] = {  
            player1: socket.id,  
            player2: data.id,  
            whose_turn: socket.id
        };  

        io.in(socket.id).socketsJoin(roomId);  
        io.in(data.id).socketsJoin(roomId);  
        io.emit('excludeMatchers', [socket.id, data.id]);  
        io.to(roomId).emit('gameStarted', { status: true, game_id: roomId, game_data: rooms[roomId] });  

      }  
      
    }); 

  })
  // useSocketServer(io, {controllers: [__dirname + "/api/controllers/*.ts"]})

  return io
}