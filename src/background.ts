import { DOMMessage } from "./app/models/DOMMessage.model";
import { FirebaseService } from "./app/services/firebase.service";

// Valida a aba do usuario para exibir o popup
const validShowExtensionInPage = () => {
  chrome.webNavigation.onCompleted.addListener(
    () => {
      chrome.tabs.query({ active: true, currentWindow: true }, ([{ id }]) => {
        if (id == null || id === undefined) return;
        chrome.pageAction?.show(id);
      });
    },
    { url: [{ urlMatches: 'youtube.com' }] }
  );
};

chrome.runtime.onInstalled.addListener(validShowExtensionInPage);

const firebaseService = new FirebaseService();
// Mensagens enviadas do content.js
const messagesFromContentAppListener = (msg: DOMMessage) => {

  switch (msg.command) {
    case 'pause':
      firebaseService.updateRoom(msg.data.roomId, { roomId: msg.data.roomId, pause: true });
      break;
    case 'play':
        firebaseService.updateRoom(msg.data.roomId, { roomId: msg.data.roomId, pause: false });
      break;
    case 'createRoom':
      const roomId = (Math.random() + 1).toString(36).substring(7);
      const newRoom = {
        roomId,
        link: msg.data.link,
        pause: true
      }
      firebaseService.createRoom(roomId, newRoom);

      portFromContent.postMessage({ command: 'createdRoom', data: { newRoom } });
      break;
    case 'entryRoom':
      firebaseService.observableRoom(msg.data.roomId, (snapshot) => {
        const data = snapshot.val();
        portFromContent.postMessage({ command: 'updateVideo', data });
      });
      break;

    default:
      break;
  }
}

var portFromContent: chrome.runtime.Port;

function connected(p: chrome.runtime.Port) {
  portFromContent = p;
  portFromContent.onMessage.addListener(messagesFromContentAppListener);

  // firebaseService.observableRoom('str1', (snapshot) => {
  //   const data = snapshot.val();
  //   portFromContent.postMessage({ command: 'updateVideo', data });
  // });
}

chrome.runtime.onConnect.addListener(connected);

