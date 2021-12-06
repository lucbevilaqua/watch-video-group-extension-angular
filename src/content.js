const myPort = chrome.runtime.connect({ name: 'port-from-cs' });
var admId = (Math.random() + 1).toString(36).substring(7);
var roomData = { };
var video;
var containerIcons;
var extensionId;

const isAdmin = () => admId === roomData.admId;

const updateVideoFirebase = () => {
  const data = {
    roomId: roomData?.roomId,
    pause: video.paused,
    time: video.currentTime
  };

  roomData?.roomId && myPort.postMessage({ command: 'updateStatusVideo', data });
}

const setEndVideoFirebase = () => {
  const data = {
    roomId: roomData?.roomId
  };

  if (!roomData?.isEnd && video?.currentTime >= (video?.duration - 60)) {
    data.isEnd = true;
  } else if (roomData?.isEnd && video?.currentTime <= (video?.duration - 60)) {
    data.isEnd = false;
  }

  (roomData?.roomId && data.isEnd) && myPort.postMessage({ command: 'updateStatusVideo', data });
}

const setNewLinkVideoFirebase = () => {
  const data = {
    roomId: roomData?.roomId,
    link: window.location.href
  };

  roomData?.roomId && myPort.postMessage({ command: 'updateStatusVideo', data });
}

const removeVideoControl = () => {
  video.controls = false;
  const containerControl = document.querySelector('.ytp-chrome-bottom');
  containerControl.querySelector('.ytp-left-controls button').style.display = 'none';
  containerControl.querySelector('.ytp-left-controls a').style.display = 'none';
  video.style. pointerEvents = 'none';
}

const removeElement = (querySelector) => document.querySelector(querySelector).parentNode.removeChild(document.querySelector(querySelector));

const createButton = (id, label, classList, onClick) => {
  const button = document.createElement('button');

  button.setAttribute('id', id);
  button.classList.add(`btn`, ...classList);
  button.innerHTML = label;
  button.addEventListener('click', onClick);
  return button;
}

const createCheckbox = (label) => {
  const container = document.createElement('div');
  container.classList.add('checkbox-container');

  const checkboxContainer = document.createElement('div');
  checkboxContainer.setAttribute(`id`, 'checkboxContainer');
  checkboxContainer.classList.add('checkbox', 'style-scope', 'tp-yt-paper-checkbox');

  const checkbox = document.createElement('div');
  checkbox.setAttribute(`id`, 'checkbox');
  checkbox.classList.add('style-scope', 'tp-yt-paper-checkbox');
  checkboxContainer.addEventListener('click', () => {
    const isChecked = checkbox.classList.contains('checked');
    if (isChecked) {
      checkbox.classList.remove('checked');
      checkmark.classList.add('hidden');
    } else {
      checkbox.classList.add('checked');
      checkmark.classList.remove('hidden');
    }
  });

  const checkmark = document.createElement('div');
  checkmark.setAttribute(`id`, 'checkmark');
  checkmark.classList.add('hidden', 'style-scope', 'tp-yt-paper-checkbox');

  const labelElement = document.createElement('p');
  labelElement.classList.add('text');
  labelElement.innerHTML = label;

  checkbox.appendChild(checkmark);
  checkboxContainer.appendChild(checkbox);
  container.appendChild(checkboxContainer);
  container.appendChild(labelElement);

  return container;
}

const createNewRoom = () => {
  video.pause();
  const time = video.currentTime;
  const blockControls = document.querySelector('dialog #checkbox')?.classList?.contains('checked') ?? false;
  myPort.postMessage({ command: 'createRoom', data: { link: window.location.href, time, blockControls, admId } })
}

const enterRoom = (isCreatedRoom = false) => {
  const inputRoomId = document.getElementById('inputRoomId');
  const roomId = roomData?.roomId ?? inputRoomId.value;
  if (roomId) {
    localStorage.setItem('roomId', roomId);

    myPort.postMessage({ command: 'enterRoom', data: { roomId } });
    document.querySelector('dialog #btnLeaveRoom').style.display = 'flex';

    removeElement('dialog #btnCreateRoom');
    removeElement('dialog #btnEnterRoom');
    removeElement('dialog #checkboxContainer');
    localStorage.removeItem('admId');

    if (!isCreatedRoom) {
      toogleDialog(false);
      removeElement('dialog #inputRoomId');
      localStorage.setItem('admId', admId);
    }
  } else {
    leaveRoom();
  }
}

const leaveRoom = () => {
  localStorage.removeItem('roomId');
  localStorage.removeItem('admId');
  window.location.reload();
}

const createDialog = (title) => {
  // Create dialog
  const dialog = document.createElement('dialog');
  dialog.classList.add(`dialog`);

  // Elements in Header
  const header = document.createElement('div');
  header.classList.add('header');

  const h2 = document.createElement('h2');
  h2.innerHTML = title;

  const close = document.createElement('button');
  close.classList.add(`close`);
  close.addEventListener('click', () => toogleDialog(false));
  close.innerHTML = 'X';

  // Elements in Body
  const body = document.createElement('div');
  body.classList.add(`body`);

  const containerInput = document.createElement('div');
  containerInput.classList.add(`container-input`);

  const inputRoomId = document.createElement('input');
  inputRoomId.setAttribute(`id`, 'inputRoomId');
  inputRoomId.setAttribute(`placeholder`, 'Cole o codigo da sala');

  const checkbox = createCheckbox('Controle do video fechado.')

  // Elements in Footer
  const footer = document.createElement('footer');
  footer.classList.add(`footer`);

  const btnLeaveRoom = createButton('btnLeaveRoom', 'Sair da sala', ['red'], leaveRoom);
  btnLeaveRoom.style.display = 'none';

  const btnCreateRoom = createButton('btnCreateRoom', 'Criar Sala', ['cornflowerblue'], createNewRoom);

  const btnEnterRoom = createButton('btnEnterRoom', 'Entrar na Sala', ['green'], enterRoom);

  // Add Element in Header
  header.appendChild(h2);
  header.appendChild(close);

  // Add Elements in Body
  containerInput.appendChild(inputRoomId);
  body.appendChild(containerInput);
  body.appendChild(checkbox);

  // Add Elements in Footer
  footer.appendChild(btnLeaveRoom);
  footer.appendChild(btnCreateRoom);
  footer.appendChild(btnEnterRoom);

  // Add all in Dialog
  dialog.appendChild(header);
  dialog.appendChild(body);
  dialog.appendChild(footer);

  return dialog;
}

const toogleDialog = (isOpen) => {
  const dialog = document.querySelector('dialog');
  if (isOpen) {
    dialog.showModal();
    document.body.style.opacity = 0.6;
  } else {
    dialog.close();
    document.body.style.opacity = 1;
  }
}

const createSessionInfoRoom = () => {
  // Create icon
  const imgIcon = document.createElement('img');
  imgIcon.classList.add('img-icon');
  imgIcon.setAttribute('src', `chrome-extension://${extensionId}/assets/icons/groups_white_24dp.svg`);

  // Clone tag a of youtube
  const iconWatchGroup = document.createElement('a');
  iconWatchGroup.setAttribute('id', 'btnOpenDialog');
  iconWatchGroup.classList.add('container-icon', 'yt-simple-endpoint', 'style-scope', 'ytd-button-renderer', 'container-icon');
  iconWatchGroup.setAttribute('title', 'Watch Group');
  iconWatchGroup.addEventListener('click', () => toogleDialog(true));

  iconWatchGroup.appendChild(imgIcon);
  containerIcons.insertBefore(iconWatchGroup, containerIcons.lastElementChild);

  const dialog = createDialog('Assitir video com o grupo');
  document.body.appendChild(dialog);
}

const createListeners = () => {
  video.addEventListener('pause', () => updateVideoFirebase());
  video.addEventListener('play', () => updateVideoFirebase());
  video.addEventListener('timeupdate', () => {
    video.paused && updateVideoFirebase();
    setEndVideoFirebase();
  });
}

const onLoadPage = () => {
  myPort.postMessage({ command: 'getExtensionId' });
  admId = localStorage.getItem('admId') ?? admId;

  const intervalSessionInfo = setInterval(() => {
    // Get Header Container
    containerIcons = document.querySelector('#buttons ytd-topbar-menu-button-renderer')?.parentElement;

    if (extensionId && !!containerIcons) {
      createSessionInfoRoom();
      clearInterval(intervalSessionInfo);
    }
  }, 150)

  const intervalVideo = setInterval(() => {
    if (document.querySelector('video') && document.querySelector('video').readyState === 4 && !!containerIcons) {
      video = document.querySelector('video');
      roomData.roomId = localStorage.getItem('roomId') === 'undefined' || !localStorage.getItem('roomId') ? null : localStorage.getItem('roomId');
      roomData.roomId && enterRoom(false);
      roomData.isEnd && updateVideoFirebase();
      createListeners();
      clearInterval(intervalVideo);
    }
  }, 150)
}

const updateVideoListener = (msg) => {
  roomData = msg.data;
  let hasNewLink = false;
  if (!msg.data?.isEnd && window.location.href !== msg.data?.link) {
    window.location.href =  msg.data?.link;
  } else if (msg.data?.isEnd && window.location.href !== msg.data?.link) {
    setNewLinkVideoFirebase();
    hasNewLink = true;
  }
  if (!hasNewLink && msg.data?.pause !== video?.paused) {
    msg.data?.pause ? video?.pause() : video?.play();
  }
  if (!hasNewLink && video?.currentTime !== msg.data.time) {
    video.currentTime = msg.data.time;
  }
  if (!isAdmin() && msg.data.blockControls) {
    removeVideoControl();
  }
}

const createdRoomListener = (msg) => {
  const bodyDialog = document.querySelector('dialog .body');
  const h2 = document.createElement('h2');
  roomData = msg.data.roomData;
  h2.innerHTML = 'Codigo da sua sala: ' + roomData.roomId;
  h2.style.marginTop = '1rem';
  bodyDialog.appendChild(h2);

  enterRoom(true);
}

window.addEventListener('load', () => {
  onLoadPage();
});

myPort.onMessage.addListener((msg) => {
  switch (msg.command) {
    case 'updateVideo':
      updateVideoListener(msg);
      break;
    case 'createdRoom':
      createdRoomListener(msg);
      break;
    case 'setExtensionId':
      extensionId = msg.data.id;
      break;
    default:
      break;
  }
});
