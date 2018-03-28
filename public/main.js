const socket = io();

const $modalContainer = document.getElementById('modal');
const $usernameInput = document.getElementById('username-input');
const $emailInput = document.getElementById('email-input');
const $buttonOK = document.getElementById('button-ok');
const $chatWrapper = document.getElementById('chat-wrapper');
const $userLists = document.getElementsByClassName('user-lists')[0];
const $errorSpan = document.getElementsByClassName('error-message')[0];
const $currentUserAvatar = document.getElementsByClassName('current-user-avatar')[0];
const $messageContainer = document.getElementById('message');
const $messageTextarea = document.getElementById('message-textarea');

let isConnected = false;
let currentUsername;

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

  socket.on('LOGIN_SUCCESSFUL', (data) => {
    isConnected = true;
    currentUsername = data.username;
    $modalContainer.close();
    $chatWrapper.classList.remove('hidden');
    log('You joined the chat');
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

const isUserExistOnSidebar = (user) => {
  const $user = document.getElementById(user);
  if ($user && $user.id !== user) {
    return true;
  }
  return false;
}

const isCurrentUser = (username) => {
  if(currentUsername === username) {
    return true;
  }

  return false;
};

const addAvatarBesideTextarea = (user) => {
  $currentUserAvatar.src = user.imgUrl;
};

const removeUserFromSidebar = (data) => {
  const $user = document.getElementById(data.username);
  if(!isUserExistOnSidebar(data.username)) {
    $user.remove();
  }
}

const log = (message) => {
  if(isConnected) {
    const $messageStatusContainer = document.createElement('div');
    $messageStatusContainer.classList += 'message-statuses';

    const $messageStatus = document.createElement('div');
    $messageStatus.classList += 'message-status';

    $messageStatus.innerHTML = message;

    $messageStatusContainer.appendChild($messageStatus);
    $messageContainer.appendChild($messageStatusContainer);
  }
}

const onSendMessage = (event) => {
  if(event.keyCode === 13 && !event.shiftKey) {
    event.preventDefault();
    
    const message = $messageTextarea.value;

    addNewChatMessage({
      message,
      username: currentUsername,
    });

    socket.emit('SEND_NEW_MESSAGE', {
      message,
    });
  }
}

$messageTextarea.addEventListener("keydown", onSendMessage);

const addNewChatMessage = (data) => {
  const $newMessageContainer = document.createElement('div');
  const $nameHolder = document.createElement('h3');
  const $messageDescription = document.createElement('span');

  $newMessageContainer.classList += 'message';

  if(isCurrentUser(data.username)) {
    $newMessageContainer.classList += ' right';
    $messageDescription.classList += ' caret-right';
  } else {
    $newMessageContainer.classList += ' left';
    $messageDescription.classList += ' caret-left';
  }

  $messageDescription.classList += ' caret';
  $nameHolder.innerText = data.username;
  $messageDescription.innerText = data.message;

  $newMessageContainer.appendChild($nameHolder);
  $newMessageContainer.appendChild($messageDescription);

  $messageContainer.appendChild($newMessageContainer);
  $messageTextarea.value = '';
};

socket.on('connect', () => {
  console.log('Client connected');
});

socket.on('disconnect', () => {
  log('You are disconnected');
});

socket.on('USER_JOINED', (data) => {
  if (isConnected) {
    log(`${data.username} joined the chat`);
    if (!isUserExistOnSidebar(data.username)) {
      addUserToSidebar(data);
    }
  }
});

socket.on('SET_USERS', (data) => {
  if(isConnected && data.users.length !== 0) {
    Object.keys(data.users).map((user) => {
      const aUser = data.users[user];
      if (!isUserExistOnSidebar(aUser.username)) {
        addUserToSidebar(aUser) 
      }

      if (isCurrentUser) {
        addAvatarBesideTextarea(aUser);
      }
    });
  }
});

socket.on('USER_LEFT', (data) => {
  if(isConnected) {
    log(`${data.username} left the chat`);
    removeUserFromSidebar(data);
  }
});

socket.on('NEW_MESSAGE', (data) => {
  if(isConnected) {
    addNewChatMessage(data);
  }
})
