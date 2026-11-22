import dns from 'dns';
// Fixes the 'querySrv ECONNREFUSED' error by forcing public DNS, required when using a mobile hotspot
dns.setServers(['8.8.8.8', '8.8.4.4']);

import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import cors from 'cors';
import http from 'http';

import { handleSocketConnection } from './controllers/chatController';
import chatRoutes from './routes/chatRoutes';

dotenv.config();

const app = express();

// Standard architecture and not used by Socket.io, but kept for future REST endpoints
app.use(cors());
app.use(express.json());
app.use('/api', chatRoutes);

// Setup HTTP server and Socket.io
const server = http.createServer(app);
// Initialize Socket.io with CORS settings to allow connections from any origin
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

// Socket.io connection handler
io.on('connection', (socket) => handleSocketConnection(io, socket));

mongoose.connect(process.env.MONGO_URI as string)
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.error('MongoDB Connection Error:', error));

const PORT = process.env.PORT;

// Start the server and listen on the specified port
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});