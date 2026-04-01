// script.js
const socket = io();

const joinScreen = document.getElementById('join-screen');
const chatApp = document.getElementById('chat-app');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('msg');
const messagesContainer = document.getElementById('messages');

let currentUser = "";

function joinRoom() {
    const username = document.getElementById('username').value;
    const roomId = document.getElementById('roomId').value;

    if (username && roomId) {
        currentUser = username;
        document.getElementById('currentRoom').innerText = roomId;
        document.getElementById('userLabel').innerText = username;

        // Tell server to join room
        socket.emit('joinRoom', { username, roomId });

        joinScreen.style.display = 'none';
        chatApp.style.display = 'flex';
    } else {
        alert("Please fill in both fields!");
    }
}

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (messageInput.value) {
        const data = {
            user: currentUser,
            msg: messageInput.value,
            room: document.getElementById('currentRoom').innerText
        };
        
        socket.emit('chatMessage', data);
        messageInput.value = '';
    }
});

socket.on('message', (data) => {
    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add(data.user === currentUser ? 'me' : 'other');
    
    div.innerHTML = `<span class="msg-user">${data.user}</span>${data.msg}`;
    
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
});
