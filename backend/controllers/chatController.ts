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

// Helper to ensure a user isn't stuck in the queue multiple times
const removeFromQueue = (deviceID: string) => {
  waitingUsers = waitingUsers.filter(user => user.deviceID !== deviceID);
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
      
    } else {
      // The '!' (non-null assertion) tells TypeScript that this parameter is not empty
      // Even though the interface marks deviceID as optional (?), it has a value because it was assigned earlier in the function
      waitingUsers.push({ deviceID: socket.deviceID!, socket: socket });
      socket.emit('waiting');

      console.log(`[QUEUE] Users waiting: ${waitingUsers.length}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[SOCKET DISCONNECT] ${socket.id}`);

    if (socket.deviceID) removeFromQueue(socket.deviceID);
  });
};