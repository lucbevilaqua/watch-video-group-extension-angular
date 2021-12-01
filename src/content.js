var myPort = chrome.runtime.connect({ name: 'port-from-cs' });
var roomData = { };
var video;
var containerIcons;
var extensionId;

const updateVideoFirebase = () => {
  const data = {
    roomId: roomData?.roomId,
    pause: video.paused,
    time: video.currentTime
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

const createButton = (id, label, classList, onClick) => {
  const button = document.createElement('button');

  button.setAttribute('id', id);
  button.classList.add(`btn`, ...classList);
  button.innerHTML = label;
  button.addEventListener('click', onClick);
  return button;
}

const createNewRoom = () => {
  video.pause();
  var time = video.currentTime;
  myPort.postMessage({ command: 'createRoom', data: { link: window.location.href, time } })
}

const enterRoom = (isCreatedRoom = false) => {
  const inputRoomId = document.getElementById('inputRoomId');
  const roomId = roomData?.roomId ?? inputRoomId.value;
  if (roomId) {
    localStorage.setItem('roomId', roomId);

    myPort.postMessage({ command: 'enterRoom', data: { roomId } });
    document.querySelector('dialog #btnLeaveRoom').style.display = 'flex';
    document.querySelector('dialog #btnCreateRoom').parentNode.removeChild(document.querySelector('dialog #btnCreateRoom'));
    document.querySelector('dialog #btnEnterRoom').parentNode.removeChild(document.querySelector('dialog #btnEnterRoom'));

    if (!isCreatedRoom) {
      toogleDialog(false);
      document.getElementById('inputRoomId').value = roomId;
      // removeVideoControl();
    }
  } else {
    leaveRoom();
  }
}

const leaveRoom = () => {
  localStorage.removeItem('roomId');
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
  video.addEventListener('timeupdate', () => video.paused && updateVideoFirebase());
}

const onLoadPage = () => {
  myPort.postMessage({ command: 'getExtensionId' });

  const intervalSessionInfo = setInterval(() => {
    // Get Header Container
    containerIcons = document.querySelector('#buttons ytd-topbar-menu-button-renderer')?.parentElement;

    if (extensionId && !!containerIcons) {
      createSessionInfoRoom();
      roomData.roomId = localStorage.getItem('roomId') === 'undefined' || !localStorage.getItem('roomId') ? null : localStorage.getItem('roomId');
      roomData.roomId && enterRoom(false);
      clearInterval(intervalSessionInfo);
    }
  }, 150)

  const intervalVideo = setInterval(() => {
    if (document.querySelector('video')) {
      video = document.querySelector('video');
      createListeners();
      clearInterval(intervalVideo);
    }
  }, 150)
}

window.addEventListener('load', () => {
  onLoadPage();
});

myPort.onMessage.addListener((msg) => {
  switch (msg.command) {
    case 'updateVideo':
      if (window.location.href !== msg.data?.link) {
        window.location.href =  msg.data?.link;
      }
      if (msg.data?.pause !== video.paused) {
        msg.data?.pause ? video?.pause() : video?.play();
      }
      if (video.currentTime !== msg.data.time) {
        video.currentTime = msg.data.time;
      }
      break;
    case 'createdRoom':
      const bodyDialog = document.querySelector('dialog .body');
      const h2 = document.createElement('h2');
      roomData = msg.data.roomData;
      h2.innerHTML = 'Codigo da sua sala: ' + roomData.roomId;
      h2.style.marginTop = '1rem';
      bodyDialog.appendChild(h2);

      enterRoom(true);
      break;
    case 'setExtensionId':
      extensionId = msg.data.id;
      break;
    default:
      break;
  }
});
