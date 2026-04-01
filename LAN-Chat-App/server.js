const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

// Store user data: { socketId: { username, roomId } }
let users = {};

io.on("connection", (socket) => {
    console.log("User connected: " + socket.id);

    // Updated 'join' to accept roomID
    socket.on("join", ({ username, roomId }) => {
        // 1. Save user details
        users[socket.id] = { username, roomId };

        // 2. Add the socket to the specific room
        socket.join(roomId);

        // 3. Notify only the people IN that room
        socket.to(roomId).emit("message", `${username} joined the room: ${roomId}`);
        
        console.log(`${username} joined room: ${roomId}`);
    });

    socket.on("chatMessage", (msg) => {
        const user = users[socket.id];
        if (user) {
            // 4. Emit ONLY to the specific room
            io.to(user.roomId).emit("chatMessage", {
                user: user.username,
                message: msg
            });
        }
    });

    socket.on("disconnect", () => {
        const user = users[socket.id];
        if (user) {
            io.to(user.roomId).emit("message", `${user.username} left the chat`);
            delete users[socket.id];
        }
    });
});

// Fixed port to match your console log (3000)
server.listen(3001, () => {
    console.log("Server running on port 3000");
});
