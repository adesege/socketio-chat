const socket = io();

socket.on('CONNECTED', () => {
  console.log('Client connected')
});
