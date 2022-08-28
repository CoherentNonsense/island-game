const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

context.fillStyle = '#f00';
context.fillRect(0, 0, 300, 300);

const socket = new WebSocket('ws://localhost:8080');

socket.close();