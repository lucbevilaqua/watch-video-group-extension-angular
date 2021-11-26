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
const admId = (Math.random() + 1).toString(36).substring(7);
let roomData: any = null;

const isAdmin = () => admId && roomData.admId;

// Mensagens enviadas do content.js
const messagesFromContentAppListener = (msg: DOMMessage) => {

  switch (msg.command) {
    case 'pause':
      isAdmin() && firebaseService.updateRoom(msg.data.roomId, { time: msg.data.time, pause: true });
      break;
    case 'play':
      isAdmin() && firebaseService.updateRoom(msg.data.roomId, { time: msg.data.time, pause: false });
      break;
    case 'timeupdate':
      if (roomData.time !== msg.data.time) {
        isAdmin() && firebaseService.updateRoom(msg.data.roomId, { time: msg.data.time });
      }
      break;
    case 'createRoom':
      const roomId = (Math.random() + 1).toString(36).substring(7);
      const newRoom = {
        roomId,
        admId,
        link: msg.data.link,
        pause: true,
        time: msg.data.time
      }
      firebaseService.createRoom(roomId, newRoom);
      roomData = newRoom;

      portFromContent.postMessage({ command: 'createdRoom', data: { roomData } });
      break;
    case 'entryRoom':
      firebaseService.observableRoom(msg.data.roomId, (snapshot) => {
        roomData = snapshot.val();
        const data = roomData;
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

