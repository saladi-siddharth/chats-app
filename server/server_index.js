require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected')).catch(err => console.error('MongoDB connection error:', err));

// Schemas
const messageSchema = new mongoose.Schema({
  from: String,
  to: String,
  content: String,
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});
const Message = mongoose.model('Message', messageSchema);

const userSchema = new mongoose.Schema({
  username: String,
  online: { type: Boolean, default: false },
});
const User = mongoose.model('User', userSchema);

// API routes
app.get('/messages/:user1/:user2', async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const messages = await Message.find({
      $or: [
        { from: user1, to: user2 },
        { from: user2, to: user1 },
      ],
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Socket.IO
const onlineUsers = new Set();
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', async (username) => {
    socket.join(username);
    onlineUsers.add(username);
    await User.findOneAndUpdate(
      { username },
      { username, online: true },
      { upsert: true }
    );
    io.emit('user_status', { username, online: true });
    console.log(`${username} joined`);
  });

  socket.on('private_message', async ({ from, to, content }) => {
    try {
      const message = new Message({ from, to, content });
      await message.save();
      io.to(to).emit('private_message', { from, content, timestamp: message.timestamp, read: false });
      io.to(from).emit('private_message', { from, content, timestamp: message.timestamp, read: false });
    } catch (err) {
      console.error('Message save error:', err);
    }
  });

  socket.on('read_message', async ({ from, to }) => {
    try {
      await Message.updateMany(
        { from, to, read: false },
        { read: true }
      );
      io.to(to).emit('message_read', { from });
    } catch (err) {
      console.error('Read receipt error:', err);
    }
  });

  socket.on('typing', ({ from, to }) => {
    io.to(to).emit('typing', { from });
  });

  socket.on('stop_typing', ({ from, to }) => {
    io.to(to).emit('stop_typing', { from });
  });

  socket.on('disconnect', async () => {
    const username = [...onlineUsers].find(user => socket.rooms.has(user));
    if (username) {
      onlineUsers.delete(username);
      await User.findOneAndUpdate({ username }, { online: false });
      io.emit('user_status', { username, online: false });
      console.log(`${username} disconnected`);
    }
  });
});

server.listen(5000, () => console.log('Server running on port 5000'));