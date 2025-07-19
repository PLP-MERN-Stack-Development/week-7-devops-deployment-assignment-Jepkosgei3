import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Message from './models/Message.js';
import Room from './models/Room.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ Use allowed origins from .env or fallback to localhost
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173'
];

// ✅ Proper CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl or Postman) or from allowedOrigins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.options('*', cors()); // Enable preflight CORS

app.use(express.json());

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1); // Stop server if Mongo fails
  });

// ✅ Health check
app.get('/health', (req, res) => res.status(200).send('OK'));

// ✅ Rooms routes
app.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching rooms' });
  }
});

app.post('/rooms', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Room name is required' });

    let room = await Room.findOne({ name });
    if (room) return res.status(400).json({ message: 'Room already exists' });

    room = new Room({ name });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: 'Error creating room' });
  }
});

app.delete('/rooms/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const room = await Room.findOneAndDelete({ name });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    await Message.deleteMany({ room: name });
    res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting room' });
  }
});

// ✅ Socket.io setup
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('🟢 Socket connected:', socket.id);

  socket.on('joinRoom', async ({ room, username }) => {
    socket.join(room);
    const history = await Message.find({ room }).sort({ timestamp: -1 }).limit(50).lean();
    socket.emit('chatHistory', history.reverse());
  });

  socket.on('chatMessage', async ({ message, room, username }) => {
    const msg = new Message({ message, room, username });
    await msg.save();
    io.to(room).emit('newMessage', {
      message,
      username,
      room,
      timestamp: msg.timestamp,
    });
  });

  socket.on('typing', ({ room, username, isTyping }) => {
    socket.to(room).emit('typingStatus', { username, isTyping });
  });

  socket.on('disconnect', () => {
    console.log('🔴 Socket disconnected:', socket.id);
  });
});

// ✅ Server listen
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
