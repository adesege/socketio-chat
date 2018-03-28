// import required dependencies
const express = require('express');
const md5 = require('md5');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const port = process.env.PORT || 3300;
const app = express();

// Tell express where to load our static files
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = socketIO(server);

const users = {};

io.on('connection', (socket) => {
  console.log('Server connected');
  socket.on('LOGIN', (data) => {
    if(Object.keys(users).indexOf(data.username) !== -1) {
      socket.emit('LOGIN_ERROR', { message: 'Username already taken. Please choose a different username' });
      return;
    }

    socket.emit('LOGIN_SUCCESSFUL', { username: data.username });

    const userObject = {
      username: data.username,
      imgUrl: `https://www.gravatar.com/avatar/${md5(data.email)}?d=identicon`
    };

    users[data.username] = userObject;

    socket.broadcast.emit('USER_JOINED', userObject);
    socket.emit('SET_USERS', { users })
  });
});

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});
