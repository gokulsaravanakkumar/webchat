const socket = io();
let currentUser = "";

function handleLogin() {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    const r = document.getElementById('roomId').value;

    socket.emit('login', { username: u, password: p });
    socket.once('loginResponse', (res) => {
        if (res.success) {
            currentUser = res.username;
            document.getElementById('currentRoom').innerText = r;
            document.getElementById('userLabel').innerText = res.username;
            socket.emit('joinRoom', { username: res.username, roomId: r });
            document.getElementById('join-screen').style.display = 'none';
            document.getElementById('chat-app').style.display = 'flex';
        } else {
            document.getElementById('error-msg').innerText = res.message;
        }
    });
}

function toggleSettings() {
    const s = document.getElementById('settings-overlay');
    s.style.display = s.style.display === 'none' ? 'flex' : 'none';
    document.getElementById('new-username').value = currentUser;
}

function saveProfile() {
    const nU = document.getElementById('new-username').value;
    const nP = document.getElementById('new-password').value;
    socket.emit('updateProfile', { oldUsername: currentUser, newUsername: nU, newPassword: nP });
    socket.once('updateResponse', (res) => {
        if (res.success) {
            currentUser = res.newUsername;
            document.getElementById('userLabel').innerText = currentUser;
            toggleSettings();
            alert("Profile Updated!");
        }
    });
}

document.getElementById('message-form').onsubmit = (e) => {
    e.preventDefault();
    const msg = document.getElementById('msg').value;
    if (msg) {
        socket.emit('chatMessage', { user: currentUser, msg, room: document.getElementById('currentRoom').innerText });
        document.getElementById('msg').value = '';
    }
};

socket.on('message', (data) => {
    const div = document.createElement('div');
    div.className = `message ${data.user === currentUser ? 'me' : 'other'}`;
    div.innerHTML = `<b>${data.user}:</b> ${data.msg}`;
    document.getElementById('messages').appendChild(div);
    document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
});
