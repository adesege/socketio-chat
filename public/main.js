const socket = io();

const $modalContainer = document.getElementById('modal');
const $usernameInput = document.getElementById('username-input');
const $emailInput = document.getElementById('email-input');
const $buttonOK = document.getElementById('button-ok');
const $chatWrapper = document.getElementById('chat-wrapper');
const $errorSpan = document.getElementsByClassName('error-message')[0];

let isConnected = false;

$modalContainer.showModal();

const showErrorMessage = ({ message }) => {
  $errorSpan.innerText = message;
  $errorSpan.classList.remove('hidden');
}

const login = () => {
  const username = $usernameInput.value.trim();
  const email = $emailInput.value.trim();

  if (username && email) {
    socket.emit('LOGIN', { username, email });
  }

  socket.on('LOGIN_ERROR', (data) => {
    showErrorMessage(data);
  });

  socket.on('LOGIN_SUCCESSFUL', () => {
    isConnected = true;
    $modalContainer.close();
    $chatWrapper.classList.remove('hidden');
  });
};

socket.on('connect', () => {
  console.log('Client connected');
});

socket.on('USER_JOINED', (data) => {
  if(isConnected) {
    console.log('USER_JOINED', data);
  }
});
