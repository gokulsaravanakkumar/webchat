const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, './')));

// Hardcoded users for your project
const registeredUsers = [
    { username: "phoenix", password: "6369" },
    { username: "cookie", password: "6384" }
];

io.on('connection', (socket) => {
    // 1. Handle Login
    socket.on('loginRequest', ({ username, password }) => {
        const user = registeredUsers.find(u => 
            u.username === username.toLowerCase() && u.password === password
        );
        
        if (user) {
            socket.emit('loginResponse', { success: true });
        } else {
            socket.emit('loginResponse', { success: false, message: "Invalid user or password" });
        }
    });

    // 2. Handle Joining Room
    socket.on('joinRoom', ({ username, roomId }) => {
        socket.join(roomId);
        console.log(`${username} joined room: ${roomId}`);

        // Notify others in the room
        socket.to(roomId).emit('message', {
            username: 'System',
            text: `${username} joined the chat`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    });

    // 3. Handle Chat Messages
    socket.on('chatMessage', (data) => {
        const msg = {
            username: data.username,
            text: data.text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            room: data.room
        };
        // Send to everyone in the room (including sender)
        io.to(data.room).emit('message', msg);
    });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`🚀 Sleek Server: http://localhost:${PORT}`));
