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

// Serve static React build files
app.use(express.static(path.join(__dirname, '../frontend/dist')));


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

// Start the server
server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
