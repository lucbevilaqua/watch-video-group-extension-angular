var myPort = chrome.runtime.connect({ name: 'port-from-cs' });
var roomData;

const updateVideoFirebase = (command) => {
  const data = {
    roomId: roomData?.roomId,
    time: document.querySelector('video').currentTime
  };

  roomData?.roomId && myPort.postMessage({ command, data });
}

const removeVideoControl = () => {
  document.querySelector('video').controls = false;
  const containerControl = document.querySelector('.ytp-chrome-bottom');
  containerControl.querySelector('.ytp-left-controls button').style.display = 'none';
  containerControl.querySelector('.ytp-left-controls a').style.display = 'none';
  document.querySelector('video').style. pointerEvents = 'none';
}

const createNewRoom = () => {
  var time = document.querySelector('video').currentTime;
  myPort.postMessage({ command: 'createRoom', data: { link: window.location.href, time } })
}

const entryRoom = (isCreatedRoom = false) => {
  const inputRoomId = document.getElementById('inputRoomId');

  myPort.postMessage({ command: 'entryRoom', data: { roomId: roomData?.roomId || inputRoomId.value } })
  if (!isCreatedRoom) {
    toogleDialog(false)
    removeVideoControl();
  }
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

  const btnCreateRoom = document.createElement('button');
  btnCreateRoom.classList.add(`btn`, 'cornflowerblue');
  btnCreateRoom.innerHTML = 'Criar Sala';
  btnCreateRoom.addEventListener('click', createNewRoom);

  const btnEntryRoom = document.createElement('button');
  btnEntryRoom.classList.add(`btn`, 'green');
  btnEntryRoom.innerHTML = 'Entrar na Sala';
  btnEntryRoom.addEventListener('click', () => entryRoom(false));

  // Add Element in Header
  header.appendChild(h2);
  header.appendChild(close);

  // Add Elements in Body
  containerInput.appendChild(inputRoomId);
  body.appendChild(containerInput);

  // Add Elements in Footer
  footer.appendChild(btnCreateRoom);
  footer.appendChild(btnEntryRoom);

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
  // Get Container Icons
  const containerIcons = document.getElementById('top-level-buttons-computed');

  // Create icon
  const imgIcon = document.createElement('img');
  imgIcon.classList.add('img-icon');
  imgIcon.setAttribute('src', 'chrome-extension://bpfgbpjkkkegjckkboopgfcammdgafdi/assets/icons/groups_white_24dp.svg');

  // Create Title of Icon
  const spanIcon = document.createElement('span');
  spanIcon.classList.add('text-icon');
  spanIcon.innerHTML = 'Watch Group';

  // Clone tag a of youtube
  const cloneIcon = containerIcons.querySelector('ytd-button-renderer a').cloneNode(false);
  cloneIcon.classList.add('container-icon');
  cloneIcon.setAttribute('title', 'Watch Group');
  cloneIcon.addEventListener('click', () => toogleDialog(true));

  cloneIcon.appendChild(imgIcon);
  cloneIcon.appendChild(spanIcon);
  containerIcons.appendChild(cloneIcon);

  const dialog = createDialog('Assitir video com o grupo');
  document.body.appendChild(dialog);
}

window.addEventListener('load', () => {
  // Exibe a sala

  const interval = setInterval(() => {
    if (document.getElementById('top-level-buttons-computed')) {
      createSessionInfoRoom()
      clearInterval(interval);
    }
  }, 150)
})

document.querySelector('video').addEventListener('pause', () => updateVideoFirebase('pause'));

document.querySelector('video').addEventListener('play', () => updateVideoFirebase('play'));

document.querySelector('video').addEventListener('timeupdate', () => document.querySelector('video').paused && updateVideoFirebase('timeupdate'));

myPort.onMessage.addListener((msg) => {

  switch (msg.command) {
    case 'updateVideo':
      document.querySelector('video').currentTime = msg.data.time;
      if (msg.data?.pause) {
        document.querySelector('video')?.pause();
      } else {
        document.querySelector('video')?.play();
      }
      break;
    case 'createdRoom':
      const bodyDialog = document.querySelector('dialog .body');
      const h2 = document.createElement('h2');
      roomData = msg.data.roomData;
      h2.innerHTML = 'Codigo da sua sala: ' + roomData.roomId;
      h2.style.marginTop = '1rem';
      bodyDialog.appendChild(h2);

      entryRoom(true);
      break
    default:
      break;
  }
});
