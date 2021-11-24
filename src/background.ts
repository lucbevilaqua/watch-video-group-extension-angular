import { DOMMessage, DOMMessageResponse, ChromeApiService } from "./app/services/chrome-api.service";

const chromeApiService = new ChromeApiService();

const play = () => {
  document.querySelector('video')?.play();
}

const pause = () => {
  document.querySelector('video')?.pause();
}

const validShowExtensionInPage = () => {
  chrome.webNavigation.onCompleted.addListener(
    () => {
      chrome.tabs.query({ active: true, currentWindow: true }, ([{ id }]) => {
        if (id == null) return;
        chrome.pageAction.show(id);
      });
    },
    { url: [{ urlMatches: 'youtube.com' }] }
  );
};

chrome.runtime.onInstalled.addListener(validShowExtensionInPage);

const messagesFromAngularAppListener = (msg: DOMMessage, sender: chrome.runtime.MessageSender, sendResponse: (response: DOMMessageResponse) => void) => {
  if (msg.command === 'pause'){

    // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    //   const id = tabs[0].id;
    //   if (id == null) return;
    //   chrome.scripting.executeScript({
    //     target: { tabId: id },
    //     func: pause
    //   }, () => {});
    // });
    chromeApiService.executeScript(pause);
    sendResponse({type: 'result', status: 'success', data: null, request: msg });
  } else if (msg.command === 'play') {
    chromeApiService.executeScript(play);

    sendResponse({type: 'result', status: 'success', data: null, request: msg });
  }

  return true;
}

chrome.runtime.onMessage.addListener(messagesFromAngularAppListener);
