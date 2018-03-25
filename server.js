// import required dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const port = process.env.PORT || 3300;
const app = express();

// Tell express where to load our static files
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = socketIO(server);

io.on('connection', (socket) => {
  console.log('Server connected');
  socket.emit('CONNECTED', () => { })
});

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});
