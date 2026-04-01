/* 🔐 Predefined Users */
let registeredUsers = [
    { username: "phoenix", password: "6369" },
    { username: "cookie", password: "6384" }
];

const socket = io();
let currentUser = "";

function handleLogin() {

    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    const r = document.getElementById('roomId').value.trim();

    if (!u || !p || !r) {
        document.getElementById('error-msg').innerText =
            "Please fill all fields!";
        return;
    }

    const user = registeredUsers.find(
        user => user.username === u && user.password === p
    );

    if (!user) {
        document.getElementById('error-msg').innerText =
            "Invalid user";
        return;
    }

    currentUser = user.username;

    document.getElementById('currentRoom').innerText = r;
    document.getElementById('userLabel').innerText = currentUser;

    socket.emit('joinRoom', {
        username: currentUser,
        roomId: r
    });

    document.getElementById('join-screen').style.display = 'none';
    document.getElementById('chat-app').style.display = 'flex';

    document.getElementById('error-msg').innerText = "";
}
