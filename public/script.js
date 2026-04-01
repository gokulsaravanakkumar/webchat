const socket = io();
let currentUser = "";

/* 🔐 Predefined Users */
let registeredUsers = [
    { username: "phoenix", password: "6369" },
    { username: "cookie", password: "6384" }
];

function handleLogin() {

    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    const r = document.getElementById('roomId').value.trim();

    if (!u || !p || !r) {
        document.getElementById('error-msg').innerText =
            "Please fill all fields!";
        return;
    }

    // 🔎 Check predefined users
    const user = registeredUsers.find(
        user => user.username === u && user.password === p
    );

    if (!user) {
        document.getElementById('error-msg').innerText =
            "Invalid user";
        return;
    }

    // ✅ Login Success
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

function toggleSettings() {
    const s = document.getElementById('settings-overlay');
    s.style.display =
        s.style.display === 'none' ? 'flex' : 'none';

    document.getElementById('new-username').value = currentUser;
}

function saveProfile() {

    const nU = document.getElementById('new-username').value.trim();
    const nP = document.getElementById('new-password').value.trim();

    // Update local array
    const userIndex = registeredUsers.findIndex(
        u => u.username === currentUser
    );

    if (userIndex !== -1) {
        registeredUsers[userIndex].username = nU;
        if (nP) {
            registeredUsers[userIndex].password = nP;
        }

        currentUser = nU;
        document.getElementById('userLabel').innerText =
            currentUser;

        toggleSettings();
        alert("Profile Updated!");
    }
}

document.getElementById('message-form').onsubmit = (e) => {

    e.preventDefault();

    const msg = document.getElementById('msg').value.trim();

    if (!msg) return;

    socket.emit('chatMessage', {
        user: currentUser,
        msg,
        room: document.getElementById('currentRoom').innerText
    });

    document.getElementById('msg').value = '';
};

socket.on('previousMessages', (messages) => {

    const container = document.getElementById('messages');
    container.innerHTML = '';

    messages.forEach(data => {
        const div = document.createElement('div');
        div.className =
            `message ${data.user === currentUser ? 'me' : 'other'}`;
        div.innerHTML =
            `<b>${data.user}:</b> ${data.msg}`;

        container.appendChild(div);
    });
});

socket.on('message', (data) => {

    const div = document.createElement('div');

    div.className =
        `message ${data.user === currentUser ? 'me' : 'other'}`;

    div.innerHTML =
        `<b>${data.user}:</b> ${data.msg}`;

    const container = document.getElementById('messages');
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
});
