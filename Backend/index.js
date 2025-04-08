const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Frontend running on port 5173
    methods: ["GET", "POST"]
  }
});

let users = [];

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Listen for the 'newuser' event (when user joins)
  socket.on('newuser', (username) => {
    users.push({ id: socket.id, username });
    console.log(`${username} has joined the chat`);
    io.emit('update', `${username} has joined the chat`);
  });

  // Listen for the 'chat' event (when a message is sent)
  socket.on('chat', (message) => {
    console.log('Message received:', message);
    io.emit('chat', message);  // Broadcast message to all clients
  });

  // Listen for the 'exit' event (when a user leaves the chat)
  socket.on('exit', () => {
    const user = users.find(user => user.id === socket.id);
    if (user) {
      console.log(`${user.username} has left the chat`);
      users = users.filter(user => user.id !== socket.id);
      io.emit('update', `${user.username} has left the chat`);
    }
  });

  // Handle client disconnect
  socket.on('disconnect', () => {
    const user = users.find(user => user.id === socket.id);
    if (user) {
      console.log(`${user.username} has disconnected`);
      users = users.filter(user => user.id !== socket.id);
      io.emit('update', `${user.username} has left the chat`);
    }
  });
});

// Start the server
server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
