const dns = require('dns');
// Set DNS servers to Google DNS FIRST to fix SRV resolution
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const passport = require('passport');

// Load environment variables FIRST
dotenv.config();

// Now load passport config
require('./config/passport');

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const messageRoutes = require('./routes/message');
const userRoutes = require('./routes/user');
const upload = require('./middleware/multer');
const User = require('./models/User');
const { protect } = require('./middleware/authMiddleware');

const app = express();
const server = http.createServer(app);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://chatweb-eta.vercel.app'
  ],
  credentials: true
}));

// Session middleware
app.use(session({
  secret: process.env.JWT_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/user', userRoutes);

app.post('/api/upload/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({ avatar: user.avatar });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Server is running!');
});

const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://chatweb-eta.vercel.app'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('add-user', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('get-users', Array.from(onlineUsers.keys()));
  });

  socket.on('send-message', (data) => {
    // data should have: message, chatUsers, senderId
    data.chatUsers.forEach((userId) => {
      if (userId !== data.senderId) {
        const sendUserSocket = onlineUsers.get(userId);
        if (sendUserSocket) {
          io.to(sendUserSocket).emit('receive-message', data.message);
        }
      }
    });
  });

  socket.on('typing', (data) => {
    // data should have: chatUsers, from
    data.chatUsers.forEach((userId) => {
      if (userId !== data.from) {
        const sendUserSocket = onlineUsers.get(userId);
        if (sendUserSocket) {
          io.to(sendUserSocket).emit('typing', { from: data.from });
        }
      }
    });
  });

  socket.on('stop-typing', (data) => {
    // data should have: chatUsers, from
    data.chatUsers.forEach((userId) => {
      if (userId !== data.from) {
        const sendUserSocket = onlineUsers.get(userId);
        if (sendUserSocket) {
          io.to(sendUserSocket).emit('stop-typing', { from: data.from });
        }
      }
    });
  });

  socket.on('call-user', (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      io.to(sendUserSocket).emit('incoming-call', {
        from: data.from,
        signal: data.signal,
        callerName: data.callerName
      });
    }
  });

  socket.on('accept-call', (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      io.to(sendUserSocket).emit('call-accepted', {
        signal: data.signal
      });
    }
  });

  socket.on('reject-call', (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      io.to(sendUserSocket).emit('call-rejected');
    }
  });

  socket.on('end-call', (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      io.to(sendUserSocket).emit('call-ended');
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    let disconnectedUserId = null;
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        break;
      }
    }
    if (disconnectedUserId) {
      onlineUsers.delete(disconnectedUserId);
      io.emit('get-users', Array.from(onlineUsers.keys()));
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
