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

    socket.emit('login', { username: u, password: p });

    socket.once('loginResponse', (res) => {

        if (res.success) {

            currentUser = res.username;

            document.getElementById('currentRoom').innerText = r;
            document.getElementById('userLabel').innerText = res.username;

            socket.emit('joinRoom', {
                username: res.username,
                roomId: r
            });

            document.getElementById('join-screen').style.display = 'none';
            document.getElementById('chat-app').style.display = 'flex';

            document.getElementById('error-msg').innerText = "";

        } else {
            document.getElementById('error-msg').innerText =
                "Invalid user";
        }
    });
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

    socket.emit('updateProfile', {
        oldUsername: currentUser,
        newUsername: nU,
        newPassword: nP
    });

    socket.once('updateResponse', (res) => {
        if (res.success) {
            currentUser = res.newUsername;
            document.getElementById('userLabel').innerText =
                currentUser;

            toggleSettings();
            alert("Profile Updated!");
        }
    });
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
