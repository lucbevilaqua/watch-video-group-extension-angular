import { DOMMessage } from "./app/models/DOMMessage.model";
import { FirebaseService } from "./app/services/firebase.service";

const firebaseService = new FirebaseService();
let listener: any;
let roomData: any = null;


// Mensagens enviadas do content.js
const messagesFromContentAppListener = (msg: DOMMessage) => {

  switch (msg.command) {
    case 'getExtensionId':
      portFromContent.postMessage({ command: 'setExtensionId', data: { id: chrome.runtime.id } });
      break;
    case 'updateStatusVideo':
      firebaseService.updateRoom(msg.data.roomId, msg.data);
      break;
    case 'createRoom':
      const roomId = (Math.random() + 1).toString(36).substring(7);
      const newRoom = {
        roomId,
        pause: true,
        isEnd: false,
        ...msg.data
      }
      firebaseService.createRoom(roomId, newRoom);
      roomData = newRoom;

      portFromContent.postMessage({ command: 'createdRoom', data: { roomData } });
      break;
    case 'enterRoom':
      listener = firebaseService.observableRoom(msg.data.roomId, (snapshot) => {
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
}

chrome.runtime.onConnect.addListener(connected);
