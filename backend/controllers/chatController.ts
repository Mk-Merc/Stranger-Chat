import { Server, Socket } from 'socket.io';

// Extends the base Socket type to include a custom application data
// deviceID: The permanent UUID stored on the user's phone
// roomID: The temporary chat room they are currently in
// The '?' or optional means these properties start empty (undefined) when the socket first connects, and are only filled in later when the user actually finds a match.
interface CustomSocket extends Socket {
  deviceID?: string;
  roomID?: string;
}

// Queue for matching
let waitingUsers: { deviceID: string, socket: CustomSocket }[] = [];

const roomTimers: { [roomID: string]: NodeJS.Timeout } = {};

// Helper to ensure a user isn't stuck in the queue multiple times
const removeFromQueue = (deviceID: string) => {
  waitingUsers = waitingUsers.filter(user => user.deviceID !== deviceID);
};

// Helper to end the chat and clear the timer
const endChatForRoom = (io: Server, roomID: string, socket: CustomSocket, messageToSelf: string, messageToOther: string) => {
  if (roomTimers[roomID]) {
    clearTimeout(roomTimers[roomID]);

    delete roomTimers[roomID];
  }

  socket.emit('chat_ended', { message: messageToSelf });
  socket.to(roomID).emit('chat_ended', { message: messageToOther });
  
  // Get the room object
  const room = io.sockets.adapter.rooms.get(roomID);

  if (room) {
    // id = ids of sockets (users) in the room
    room.forEach((id) => {
      // io.sockets.sockets = Map of all connected sockets
      const socket = io.sockets.sockets.get(id) as CustomSocket;

      if (socket) {
        socket.leave(roomID);
        socket.roomID = undefined;

        // The '!' (non-null assertion) tells TypeScript that this parameter is not empty
        removeFromQueue(socket.deviceID!);
      }
    });
  }
};

const startRoomTimer = (io: Server, roomID: string, socket: CustomSocket) => {
  if (roomTimers[roomID]) clearTimeout(roomTimers[roomID]);
  
  // Start a new timer for 60 seconds
  // Execute the callback function when the timer expires
  roomTimers[roomID] = setTimeout(() => {
    if (socket.roomID === roomID) {
      // Both users get the same message for inactivity
      endChatForRoom(io, roomID, socket, "Chat ended due to inactivity.", "Chat ended due to inactivity.");
    }
  }, 60000);
};  

export const handleSocketConnection = (io: Server, socket: CustomSocket) => {
  console.log(`[SOCKET CONNECT] Socket: ${socket.id}`);

  socket.on('find_stranger', (data: { deviceID: string }) => {
    socket.deviceID = data.deviceID;
    
    // Clean previous queue entries for this device
    removeFromQueue(socket.deviceID);

    let matchedUser = null;

    for (let index = 0; index < waitingUsers.length; index++) {
        const user = waitingUsers[index];

        // Prevent matching with yourself if the app accidentally sends a double request
        if (user.deviceID === socket.deviceID) continue; 
        
        // Skip ghosts (users already in a room, but still in the queue for some reason)
        if (user.socket.roomID) continue;

        matchedUser = user;
 
        break;
    }

    if (matchedUser) {
      removeFromQueue(matchedUser.deviceID);
      
      const roomID = `room_${socket.id}_${matchedUser.socket.id}`;
      
      socket.join(roomID);
      matchedUser.socket.join(roomID);

      socket.roomID = roomID;
      matchedUser.socket.roomID = roomID;

      // Tell both users they are matched
      io.to(socket.id).emit('matched', { roomID: socket.roomID, strangerDeviceID: matchedUser.deviceID });
      io.to(matchedUser.socket.id).emit('matched', { roomID: socket.roomID, strangerDeviceID: socket.deviceID });
      
      console.log(`[MATCH] Device ${socket.deviceID} with Device ${matchedUser.deviceID} in Room ${roomID}`);

      // Only need one timer per room
      startRoomTimer(io, roomID, socket);
      
    } else {
      // The '!' (non-null assertion) tells TypeScript that this parameter is not empty
      // Even though the interface marks deviceID as optional (?), it has a value because it was assigned earlier in the function
      waitingUsers.push({ deviceID: socket.deviceID!, socket: socket });
      socket.emit('waiting');

      console.log(`[QUEUE] Users waiting: ${waitingUsers.length}`);
    }
  });

  socket.on('send_message', (data: { message: string }) => {
    if (socket.roomID) {
      socket.to(socket.roomID).emit('receive_message', { message: data.message });
      
      startRoomTimer(io, socket.roomID, socket);
    }
  });

  socket.on('cancel_search', () => {
    if (socket.deviceID) {
      removeFromQueue(socket.deviceID);

      console.log(`[QUEUE] User ${socket.deviceID} canceled search. Users waiting: ${waitingUsers.length}`);
    }
  });

  socket.on('leave_chat', () => {
    if (socket.roomID) {
      endChatForRoom(io, socket.roomID, socket, "You left the chat.", "Stranger left the chat.");
    }
  });

  // Handle system disconnects (app closed, lost internet, etc.)
  socket.on('disconnect', () => {
    console.log(`[SOCKET DISCONNECT] ${socket.id}`);
    
    if (socket.deviceID) removeFromQueue(socket.deviceID);
    
    if (socket.roomID) {
      endChatForRoom(io, socket.roomID, socket, "You disconnected.", "Stranger disconnected.");
    }
  });
};