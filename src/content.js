const myPort = chrome.runtime.connect({ name: 'port-from-cs' });
var extensionId;

myPort.postMessage({ command: 'getExtensionId' });

const intervalScript = setInterval(() => {
  if('function' === typeof importScripts) {
    importScripts(`chrome-extension://${extensionId}/utils.js`, `chrome-extension://${extensionId}/youtube.js`);
    clearInterval(intervalScript);
  }
}, 1000);

myPort.onMessage.addListener((msg) => {
  switch (msg.command) {
    case 'updateVideo':
      if(msg.data) {
        setNewLinkVideoFirebase();
        updateVideoListener(msg);
      } else {
        leaveRoom();
      }
      break;
    case 'createdRoom':
      createdRoomListener(msg);
      break;
    case 'setExtensionId':
      extensionId = msg.data.id;
      break;
    case 'resultDataStorage':
      switch (Object.keys(msg.data)?.[0]) {
        case 'roomId':
          roomData.roomId = msg.data.roomId;
          if (roomData.roomId) {
            isAdmin() && enterRoomCreated();
            !isAdmin() && enterRoom();
          }
          break;
        case 'admId':
          admId = msg.data.admId ?? admId;
          break;
      }
      break;
    default:
      break;
  }
});
