var admId = (Math.random() + 1).toString(36).substring(7);
var roomData = { };
var video;
var containerIcons;

//#region Conexão com o firebase
const updateVideoFirebase = () => {
  const data = {
    roomId: roomData?.roomId,
    paused: video.paused
  };

  roomData?.roomId && myPort.postMessage({ command: 'updateStatusVideo', data });
}

const updateTimeVideoFirebase = () => {
  const data = {
    roomId: roomData?.roomId,
    paused: video.paused,
    time: video.currentTime
  };

  roomData?.roomId && myPort.postMessage({ command: 'updateStatusVideo', data });
}

const setNewLinkVideoFirebase = () => {
  if (!isWatchingVideo() || !isAdmin() || itsOnSameLink(roomData?.link)) {
    return;
  }

  const data = {
    roomId: roomData?.roomId,
    link: window.location.href
  };

  roomData?.roomId && myPort.postMessage({ command: 'updateStatusVideo', data });
}
//#endregion

// Função para remover todos os controles do video do usuario
const removeVideoControl = () => {
  video.controls = false;
  const containerControl = document.querySelector('.ytp-chrome-bottom');
  containerControl.querySelector('.ytp-left-controls button').style.display = 'none';
  containerControl.querySelector('.ytp-left-controls a').style.display = 'none';
  video.style.pointerEvents = 'none';
}

// Função para criar uma nova sala
const createNewRoom = () => {
  if (isWatchingVideo()) {
    const time = video?.currentTime ?? 0;
    const blockControls = document.querySelector('dialog #checkbox')?.classList?.contains('checked') ?? false;
    video.pause();

    myPort.postMessage({ command: 'createRoom', data: { link: window.location.href, time, blockControls, admId } })
  }
}

// Função para entrar na sala para o usuario comum (fecha o dialog com o input ainda visivel)
const enterRoom = () => {
  const inputRoomId = document.getElementById('inputRoomId');
  const roomId = roomData?.roomId ?? inputRoomId.value;

  enterRoomCreated();
  if (roomId) {
    const bodyDialog = document.querySelector('dialog .body');
    const h2 = document.createElement('h2');

    h2.innerHTML = 'Codigo da sua sala: ' +roomId;
    h2.style.marginTop = '1rem';
    bodyDialog.appendChild(h2);

    removeElement('dialog #inputRoomId');
    toogleDialog(false);

    !isAdmin() && myPort.postMessage({ command: 'removeDataInStorage', data: { key: 'admId' } });
  } else {
    leaveRoom();
  }
}

// Função para entrar na sala para o criador (esconde o input para digitar a sala)
const enterRoomCreated = () => {
  const inputRoomId = document.getElementById('inputRoomId');
  const roomId = roomData?.roomId ?? inputRoomId.value;
  if (roomId) {
    myPort.postMessage({ command: 'setDataInStorage', data: { key: 'roomId', value: roomId } });
    myPort.postMessage({ command: 'setDataInStorage', data: { key: 'admId', value: admId } });
    myPort.postMessage({ command: 'enterRoom', data: { roomId } });

    document.querySelector('dialog #btnLeaveRoom').style.display = 'flex';

    removeElement('dialog #btnCreateRoom');
    removeElement('dialog #btnEnterRoom');
    removeElement('dialog #inputRoomId');
    removeElement('dialog .container-input');
    removeElement('dialog #checkboxContainer');
    removeElement('dialog .checkbox-container');
  } else {
    leaveRoom();
  }
}

// Função que sai da sala e da um reload na tela, e em casos de admin exclui a sala
const leaveRoom = () => {
  try {
    myPort.postMessage({ command: 'removeDataInStorage', data: { key: 'roomId' } });
    myPort.postMessage({ command: 'removeDataInStorage', data: { key: 'admId' } });

    isAdmin() && roomData && myPort.postMessage({ command: 'removeRoom', data: roomData });
    window.location.reload();
  } catch (error) {
    window.location.reload();
  }
}

// Função que adiciona todos os listeners no video
const createListeners = () => {
  video.addEventListener('pause', () => updateVideoFirebase());
  video.addEventListener('play', () => updateVideoFirebase());
  video.addEventListener('timeupdate', () => video.paused && updateTimeVideoFirebase());

  const intervalVideoTime = setInterval(() => {
    const diffTime = (video?.currentTime - roomData?.time) ?? 0;

    if (roomData.roomId &&  diffTime >= 0.1 && !video?.paused) {
      updateTimeVideoFirebase()
    }
  }, 1000);
}

// Função que atualiza o video + link da tela
const updateVideoListener = (msg) => {
  roomData = msg.data;

  if (!itsOnSameLink(msg.data?.link) && !isAdmin()) {
    window.location.href = msg.data?.link;
  }

  if (video?.paused !== msg.data?.pause) {
    msg.data?.paused ? video?.pause() : video?.play();
  }

  if (hasDiffTimeVideo(msg.data.time)) {
    video.currentTime = msg.data.time;
  }

  if (!isAdmin() && msg.data.blockControls) {
    removeVideoControl();
  }
}

// Função que cria a sala e adiciona o codigo no dialog
const createdRoomListener = (msg) => {
  const bodyDialog = document.querySelector('dialog .body');
  const h2 = document.createElement('h2');

  roomData = msg.data.roomData;

  h2.innerHTML = 'Codigo da sua sala: ' + roomData.roomId;
  h2.style.marginTop = '1rem';
  bodyDialog.appendChild(h2);

  enterRoomCreated();
}

// Cria o listener para verificar o modo dark ou modo light
const createListenerTheme = () => {
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes') {
        removeElement('#btnOpenDialog');
        removeElement('#dialogWatchGroup');
      }
    });
  });

  observer.observe(document.querySelector('html'), {
    attributes: true //configure it to listen to attribute changes
  });
}

// Função chamada após a tela ser carregada
const onLoadPage = () => {
  myPort.postMessage({ command: 'getExtensionId' });
  myPort.postMessage({ command: 'getDataInStorage', data: { key: 'admId' } });
  createListenerTheme();
}

window.addEventListener('load', () => {
  onLoadPage();
});


const intervalSessionInfo = setInterval(() => {
  // Get Header Container
  containerIcons = document.querySelector('#buttons ytd-topbar-menu-button-renderer')?.parentElement;

  if (extensionId && !!containerIcons && !document.querySelector('#btnOpenDialog')) {
    createSessionInfoRoom();
  }
}, 1500)

const intervalVideo = setInterval(() => {
  // Valida se o video ja foi carregado(readyState = 4)
  if (document.querySelector('video')?.readyState === 4 && !!containerIcons && !video) {
    video = document.querySelector('video');
    myPort.postMessage({ command: 'getDataInStorage', data: { key: 'roomId' } });
    createListeners();
  }
}, 1500)

// Função para criar o dialog para entrar na sala ou criar sala
const createDialog = (title, id) => {
  // Create dialog
  const dialog = document.createElement('dialog');
  dialog.setAttribute('id', id);
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

// função que abre/fecha o dialog
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

// Função para colocar o icone do lado do perfil do usuario
const createSessionInfoRoom = () => {
  // Create icon
  const imgIcon = document.createElement('img');
  const isDarkTheme = !!document.querySelector('html').attributes.dark;
  imgIcon.classList.add('img-icon');
  imgIcon.setAttribute('src', `chrome-extension://${extensionId}/assets/icons/${isDarkTheme ? 'groups_white_24dp' : 'groups_black_24dp'}.svg`);

  // Clone tag a of youtube
  const iconWatchGroup = document.createElement('a');
  iconWatchGroup.setAttribute('id', 'btnOpenDialog');
  iconWatchGroup.classList.add('container-icon', 'yt-simple-endpoint', 'style-scope', 'ytd-button-renderer', 'container-icon');
  iconWatchGroup.setAttribute('title', 'Watch Group');
  iconWatchGroup.addEventListener('click', () => toogleDialog(true));

  iconWatchGroup.appendChild(imgIcon);
  containerIcons.insertBefore(iconWatchGroup, containerIcons.lastElementChild);

  const dialog = createDialog('Assitir video com o grupo', 'dialogWatchGroup');
  document.body.appendChild(dialog);
}
