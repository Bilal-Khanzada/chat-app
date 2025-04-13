const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let users = [];

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('newuser', (username) => {
    users.push({ id: socket.id, username });
    io.emit('update', `${username} has joined the chat`);
  });

  socket.on('chat', (message) => {
    io.emit('chat', message);
  });

  socket.on('exit', () => {
    const user = users.find(user => user.id === socket.id);
    if (user) {
      users = users.filter(u => u.id !== socket.id);
      io.emit('update', `${user.username} has left the chat`);
    }
  });

  socket.on('disconnect', () => {
    const user = users.find(user => user.id === socket.id);
    if (user) {
      users = users.filter(u => u.id !== socket.id);
      io.emit('update', `${user.username} has left the chat`);
    }
  });
});

// ✅ Put this BEFORE static file serving
app.get('/hello', (req, res) => {
  res.send('Hello from the backend!');
});

// React static files AFTER routes
app.use(express.static(path.join(__dirname, '../frontend/dist')));

server.listen(3000, '0.0.0.0', () => {
  console.log('Server running on http://13.51.205.151:3000');
});
