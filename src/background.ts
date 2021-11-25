import { DOMMessage } from "./app/services/chrome-api.service";
import { FirebaseService } from "./app/services/firebase.service";

// Valida a aba do usuario para exibir o popup
const validShowExtensionInPage = () => {
  chrome.webNavigation.onCompleted.addListener(
    () => {
      chrome.tabs.query({ active: true, currentWindow: true }, ([{ id }]) => {
        if (id == null || id === undefined) return;
        chrome.pageAction.show(id);
      });
    },
    { url: [{ urlMatches: 'youtube.com' }] }
  );
};

chrome.runtime.onInstalled.addListener(validShowExtensionInPage);

const firebaseService = new FirebaseService();
// Mensagens enviadas do content.js
const messagesFromContentAppListener = (msg: DOMMessage) => {
  if (msg.command === 'pause'){
    firebaseService.updateRoom('str1', { roomId: 'str1', pause: true });
  } else if (msg.command === 'play') {
    firebaseService.updateRoom('str1', { roomId: 'str1', pause: false });
  }
}

var portFromContent: chrome.runtime.Port;

function connected(p: chrome.runtime.Port) {
  portFromContent = p;
  portFromContent.onMessage.addListener(messagesFromContentAppListener);

  firebaseService.observableRoom('str1', (snapshot) => {
    const data = snapshot.val();
    portFromContent.postMessage({ command: 'updateVideo', data });
  });
}

chrome.runtime.onConnect.addListener(connected);

