// server.js
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, '/')));

io.on('connection', (socket) => {
    
    socket.on('joinRoom', ({ username, roomId }) => {
        socket.join(roomId);
        console.log(`${username} joined room: ${roomId}`);
    });

    socket.on('chatMessage', (data) => {
        // Send message only to the specific room
        io.to(data.room).emit('message', data);
    });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
