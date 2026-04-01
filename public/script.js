const socket = io();

const joinScreen = document.getElementById('join-screen');
const chatApp = document.getElementById('chat-app');
const messages = document.getElementById('messages');
const msgInput = document.getElementById('msg');
const messageForm = document.getElementById('message-form');

// Function to join the room
function joinRoom() {
    const username = document.getElementById('username').value;
    const roomId = document.getElementById('roomId').value;

    if (username && roomId) {
        // Emit join event with both pieces of data
        socket.emit("join", { username, roomId });

        // UI Changes
        joinScreen.style.display = 'none';
        chatApp.style.display = 'flex';
        document.getElementById('currentRoom').innerText = roomId;
        document.getElementById('userLabel').innerText = `(${username})`;
    } else {
        alert("Please enter both Name and Room ID");
    }
}

// Handle sending messages
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (msgInput.value) {
        socket.emit("chatMessage", msgInput.value);
        msgInput.value = "";
    }
});

// Listen for chat messages from the server
socket.on("chatMessage", (data) => {
    const div = document.createElement('div');
    div.innerHTML = `<strong>${data.user}:</strong> ${data.message}`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight; // Auto-scroll
});

// Listen for system messages (joins/leaves)
socket.on("message", (text) => {
    const div = document.createElement('div');
    div.classList.add('system-msg');
    div.innerText = text;
    messages.appendChild(div);
});
