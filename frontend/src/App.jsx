import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

function App() {
  const [username, setUsername] = useState('');
  const [isChatActive, setIsChatActive] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [uname, setUname] = useState('');
  const [socket, setSocket] = useState(null);

  // Establish socket connection when the component mounts
  useEffect(() => {
    const newSocket = io('http://your-ec2-ip:3000');
    setSocket(newSocket);

    // Cleanup socket connection on unmount
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket) {
      // Listen for new chat messages (this includes the sender's message from other clients)
      socket.on('chat', (message) => {
        console.log('Received message:', message);
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      // Listen for updates (user joins or leaves)
      socket.on('update', (message) => {
        console.log('Received update:', message);
        setMessages((prevMessages) => [
          ...prevMessages,
          { username: 'System', text: message },
        ]);
      });
    }
  }, [socket]);

  // Handle username input change
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  // Join chatroom handler
  const joinChat = () => {
    if (username.trim().length === 0) return;
    setUname(username);
    setIsChatActive(true);
    socket.emit('newuser', username); // Emit 'newuser' event
  };

  // Handle message input change
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  // Send message handler
  const sendMessage = () => {
    if (message.trim().length === 0) return;
    const newMessage = { username: uname, text: message };

    // Emit the message to the server, but do not add it locally yet
    socket.emit('chat', newMessage);

    setMessage(''); // Clear input field
  };

  // Handle exit chat
  const exitChat = () => {
    socket.emit('exit'); // Emit 'exit' event
    setIsChatActive(false);
    setUsername('');
    setMessages([]);
  };

  return (
    <div className="app">
      {/* Join Screen */}
      {!isChatActive ? (
        <div className="join-screen screen active">
          <div className="form">
            <h2>Join Chatroom</h2>
            <div className="form-input">
              <label>Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={handleUsernameChange}
              />
            </div>
            <div className="form-input">
              <button id="join-user" onClick={joinChat}>
                Join
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Chat Screen
        <div className="screen chat-screen active">
          <div className="header">
            <div className="logo">Chatroom</div>
            <button id="exit-chat" onClick={exitChat}>
              Exit
            </button>
          </div>
          <div className="messages">
            {/* Render Messages */}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.username === uname ? 'my-message' : 'other-message'}`}
              >
                <div className="name">{msg.username === uname ? 'You' : msg.username}</div>
                <div className="text">{msg.text}</div>
              </div>
            ))}
          </div>
          <div className="typebox">
            <input
              type="text"
              id="message-input"
              value={message}
              onChange={handleMessageChange}
            />
            <button id="send-message" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
