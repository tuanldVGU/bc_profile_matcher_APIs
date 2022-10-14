import * as http from 'http'
import {Server, Socket} from 'socket.io'

export default (httpServer: http.Server) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*"
    }
  })

  // io.set('transports', ['websocket'])

  const sockets: 
  { [index: string]: {
    socket: Socket,
    name: string,
    did: string,
    is_playing: boolean,
    room_id: string | null
  } }= {}; // stores all the connected clients  

  console.log("Create sockets.io")


  io.on('connection', socket => {
    socket.emit('connected', {"id": socket.id })

    //Register
    socket.on('checkUserDetail', data => {
      console.log(`checking`)
      const flag = Object.values(sockets).some(x => x.did == data.did)
      if (!flag) {  
        sockets[data.id] = {
            socket: socket,
            did: data.did,  
            is_playing: false,  
            // name: `Matcher-${Object.keys(sockets).length + 1}`,
            name: data.did,
            room_id: null  
        }
      }  
      socket.emit('checkUserDetailResponse', !flag); 
    })

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
          did: sockets[socket.id]?.did || 'inVALID', 
          name: sockets[socket.id]?.name || 'inVALID'
      });  
    });


    socket.on('targetMatching', (data: {
      sender: string,
      senderName: string
      id: string,
      message: Uint8Array,
      type: string
    }) => {
      data.type == "movies" ? sockets[data.id].socket.emit('requestMovies', {
          sender: data.sender,
          senderName: data.senderName,
          message: data.message
        }):
        data.type == "locations" ? sockets[data.id].socket.emit('requestLocations', {
          sender: data.sender,
          senderName: data.senderName,
          message: data.message
        }): (()=>{})()
    })

    socket.on('responseMatching', (data: {
      senderName: string,
      target: string,
      serializedServerResponse: Uint8Array,
      serializedServerSetup: Uint8Array,
      type: string
    }) => {
      sockets[data.target].socket.emit('resultMatching', {
        senderName: data.senderName,
        serializedServerResponse: data.serializedServerResponse,
        serializedServerSetup: data.serializedServerSetup,
        type: data.type
      })
    })
  })

  return io
}