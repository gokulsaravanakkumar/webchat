const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, '/')));

// In-memory database (Resets on server restart)
let registeredUsers = [
    { username: "admin", password: "123" }
];

io.on('connection', (socket) => {
    // 1. Auth Logic
    socket.on('login', ({ username, password }) => {
        const user = registeredUsers.find(u => u.username === username && u.password === password);
        if (user) {
            socket.emit('loginResponse', { success: true, username });
        } else {
            socket.emit('loginResponse', { success: false, message: "Invalid credentials" });
        }
    });

    // 2. Profile Update Logic
    socket.on('updateProfile', (data) => {
        const userIndex = registeredUsers.findIndex(u => u.username === data.oldUsername);
        if (userIndex !== -1) {
            registeredUsers[userIndex].username = data.newUsername;
            registeredUsers[userIndex].password = data.newPassword;
            socket.emit('updateResponse', { success: true, newUsername: data.newUsername });
        } else {
            socket.emit('updateResponse', { success: false, message: "User not found" });
        }
    });

    // 3. Chat Logic
    socket.on('joinRoom', ({ username, roomId }) => {
        socket.join(roomId);
    });

    socket.on('chatMessage', (data) => {
        io.to(data.room).emit('message', data);
    });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
