const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

const io = socketio(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

// Serve your index.html and style.css from the root folder
app.use(express.static(path.join(__dirname, './')));

// Sync these with your frontend "registeredUsers"
let registeredUsers = [
    { username: "phoenix", password: "6369" },
    { username: "cookie", password: "6384" },
    { username: "admin", password: "123" }
];

let chatHistory = {};

io.on('connection', (socket) => {
    console.log('✨ New connection:', socket.id);

    // 1. LOGIN LOGIC
    socket.on('login', ({ username, password }) => {
        const user = registeredUsers.find(
            u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
        );

        if (user) {
            socket.emit('loginResponse', { success: true, username: user.username });
        } else {
            socket.emit('loginResponse', { success: false, message: "Invalid credentials" });
        }
    });

    // 2. JOIN ROOM LOGIC
    socket.on('joinRoom', ({ username, roomId }) => {
        socket.join(roomId);
        console.log(`👤 ${username} joined room: ${roomId}`);

        if (!chatHistory[roomId]) {
            chatHistory[roomId] = [];
        }

        // Send chat history to the user who just joined
        socket.emit('previousMessages', chatHistory[roomId]);

        // Optional: Notify others in the room
        socket.to(roomId).emit('message', {
            username: 'System',
            text: `${username} has joined the chat`,
            time: new Date().toLocaleTimeString()
        });
    });

    // 3. MESSAGE LOGIC
    socket.on('chatMessage', (data) => {
        // data expects: { room, username, text }
        const msg = {
            username: data.username,
            text: data.text,
            time: new Date().toLocaleTimeString()
        };

        if (!chatHistory[data.room]) {
            chatHistory[data.room] = [];
        }
        
        chatHistory[data.room].push(msg);
        
        // Limit history to last 50 messages to save memory
        if(chatHistory[data.room].length > 50) chatHistory[data.room].shift();

        // Broadcast to everyone in the specific room
        io.to(data.room).emit('message', msg);
    });

    socket.on('disconnect', () => {
        console.log('❌ User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
    console.log(`🚀 Server running at http://localhost:${PORT}`)
);
