const socket = io();

const $modalContainer = document.getElementById('modal');
const $usernameInput = document.getElementById('username-input');
const $emailInput = document.getElementById('email-input');
const $buttonOK = document.getElementById('button-ok');
const $chatWrapper = document.getElementById('chat-wrapper');
const $userLists = document.getElementsByClassName('user-lists')[0];
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

const addUserToSidebar = (data) => {
  const $user = document.createElement('li');
  $user.classList += 'user';
  $user.id = data.username;

  const $userAvatar = document.createElement('img');
  $userAvatar.src = data.imgUrl;

  const $userName = document.createElement('span');
  $userName.innerText = data.username;

  $user.appendChild($userAvatar);
  $user.appendChild($userName);
  $userLists.insertBefore($user, $userLists.firstChild);
};

const isUserExist = (user) => {
  const $user = document.getElementById(user);
  if ($user && $user.id !== user) {
    return true;
  }
  return false;
}

socket.on('connect', () => {
  console.log('Client connected');
});

socket.on('USER_JOINED', (data) => {
  if (isConnected && !isUserExist(data.username)) {
    addUserToSidebar(data);
  }
});

socket.on('SET_USERS', (data) => {
  if(isConnected && data.users.length !== 0) {
    Object.keys(data.users).map((user) => {
      const aUser = data.users[user];
      if (!isUserExist(aUser.username)) {
        addUserToSidebar(aUser) 
      }
    });
  }
});
