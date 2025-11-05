import express from 'express';
import connectDatabase from './config/db.js';
import cookieParser from 'cookie-parser';
import userRoute from './route/userRoute.js';
import volunteerRoute from './route/volunteerRoute.js';
import { errorHandler } from './middleWare/errorHandler.js';
import complaintRoute from './route/complaintRoute.js';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { initSocket } from './config/socket.js';
import chatRoute from './route/chatRoute.js'


const PORT = process.env.PORT || 6000;
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Serve uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// CORS setup
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// HTTP + WebSocket server
const server = http.createServer(app);
initSocket(server)

// API routes
app.use('/api/auth', userRoute);
app.use('/api', volunteerRoute);
app.use('/api', complaintRoute);
app.use('/api/chats', chatRoute)

// Error handler
app.use(errorHandler);

// ✅ Start the server 
server.listen(PORT, () => {
  connectDatabase();
  console.log(`Server running on port ${PORT}`);
});
