const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, './')));

let registeredUsers = [
    { username: "phoenix", password: "6369" },
    { username: "cookie", password: "6384" }
];

io.on('connection', (socket) => {
    socket.on('joinRoom', ({ username, roomId }) => {
        socket.join(roomId);
        console.log(`${username} joined ${roomId}`);

        // Notify others
        socket.to(roomId).emit('message', {
            username: 'System',
            text: `${username} joined the chat`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    });

    socket.on('chatMessage', (data) => {
        const msg = {
            username: data.username,
            text: data.text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        io.to(data.room).emit('message', msg);
    });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`));
