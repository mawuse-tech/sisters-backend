import express from 'express';
import connectDatabase from './config/db.js';
import cookieParser from 'cookie-parser';
import userRoute from './route/userRoute.js';
import volunteerRoute from './route/volunteerRoute.js';
import { errorHandler } from './middleWare/errorHandler.js';
import complaintRoute from './route/complaintRoute.js';
import cors from 'cors';
import http from 'http';
import { initSocket } from './config/socket.js';
import chatRoute from './route/chatRoute.js'
import path, { dirname, join } from 'path';
import { fileURLToPath } from 'url';


const PORT = process.env.PORT || 6000;
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Serve uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// CORS setup
// app.use(cors({
//   origin: 'http://localhost:5173',
//   credentials: true
// }));
const allowedOrigins = [
  "http://localhost:5173",        // local dev
  "https://sisters-backend.fly.dev" 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(join(__dirname, 'dist')));
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Error handler
app.use(errorHandler);

// ✅ Start the server 
server.listen(PORT, () => {
  connectDatabase();
  console.log(`Server running on port ${PORT}`);
});
