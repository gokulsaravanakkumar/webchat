const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

const io = socketio(server, {
    cors: {
        origin: "*",   // For development (later replace with your Vercel URL)
        methods: ["GET", "POST"]
    }
});

app.use(express.static(path.join(__dirname, '/')));

// In-memory database (resets on restart)
let registeredUsers = [
    { username: "admin", password: "123" }
];

// Optional: Store chat messages in memory
let chatHistory = {};

io.on('connection', (socket) => {

    // LOGIN
    socket.on('login', ({ username, password }) => {
        const user = registeredUsers.find(
            u => u.username === username && u.password === password
        );

        if (user) {
            socket.emit('loginResponse', { success: true, username });
        } else {
            socket.emit('loginResponse', { success: false, message: "Invalid credentials" });
        }
    });

    // PROFILE UPDATE
    socket.on('updateProfile', (data) => {
        const userIndex = registeredUsers.findIndex(
            u => u.username === data.oldUsername
        );

        if (userIndex !== -1) {
            registeredUsers[userIndex].username = data.newUsername;
            if (data.newPassword) {
                registeredUsers[userIndex].password = data.newPassword;
            }

            socket.emit('updateResponse', {
                success: true,
                newUsername: data.newUsername
            });
        } else {
            socket.emit('updateResponse', {
                success: false,
                message: "User not found"
            });
        }
    });

    // JOIN ROOM
    socket.on('joinRoom', ({ username, roomId }) => {
        socket.join(roomId);

        if (!chatHistory[roomId]) {
            chatHistory[roomId] = [];
        }

        // Send previous messages
        socket.emit('previousMessages', chatHistory[roomId]);
    });

    // MESSAGE
    socket.on('chatMessage', (data) => {
        if (!chatHistory[data.room]) {
            chatHistory[data.room] = [];
        }

        chatHistory[data.room].push(data);

        io.to(data.room).emit('message', data);
    });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
    console.log(`🚀 Server running on port ${PORT}`)
);
