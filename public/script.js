const socket = io();
let currentUser = "";
let currentRoom = "";

function handleLogin() {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    const r = document.getElementById('roomId').value.trim();

    if (!u || !p || !r) {
        document.getElementById('error-msg').innerText = "Please fill all fields!";
        return;
    }

    // Send login request to server
    socket.emit('loginRequest', { username: u, password: p });

    // Listen for the response once
    socket.once('loginResponse', (data) => {
        if (data.success) {
            currentUser = u;
            currentRoom = r;

            // UI Update
            document.getElementById('userLabel').innerText = u;
            document.getElementById('currentRoom').innerText = r;
            document.getElementById('join-screen').style.display = 'none';
            document.getElementById('chat-app').style.display = 'flex';

            // Join the socket room
            socket.emit('joinRoom', { username: u, roomId: r });
        } else {
            document.getElementById('error-msg').innerText = data.message;
        }
    });
}

function sendMessage() {
    const input = document.getElementById('msg-input');
    if (input.value.trim()) {
        socket.emit('chatMessage', { 
            room: currentRoom, 
            username: currentUser, 
            text: input.value 
        });
        input.value = "";
    }
}

socket.on('message', (data) => {
    const container = document.getElementById('message-container');
    const isMe = data.username === currentUser;
    const isSystem = data.username === 'System';

    const msgDiv = document.createElement('div');
    msgDiv.className = isSystem ? 'msg-system' : (isMe ? 'msg-row me' : 'msg-row');
    
    msgDiv.innerHTML = isSystem ? `<span>${data.text}</span>` : `
        <div class="bubble">
            <div class="sender">${data.username}</div>
            <div class="text">${data.text}</div>
            <div class="time">${data.time}</div>
        </div>
    `;
    
    container.appendChild(msgDiv);
    
    // Auto-scroll to bottom
    container.scrollTop = container.scrollHeight;
});
