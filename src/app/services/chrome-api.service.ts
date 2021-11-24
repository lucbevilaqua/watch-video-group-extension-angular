import { Injectable } from '@angular/core';

export type DOMMessage = {
  command: 'pause' | 'play' | 'put';
  data?: any;
}

export type DOMMessageResponse = {
  type: string;
  status: string;
  data: any;
  request: DOMMessage;
}

@Injectable({
  providedIn: 'root'
})
export class ChromeApiService {

  roomId: string = 'str12';

  constructor() { }

  sendMessage(msg: DOMMessage, callback: (response: DOMMessageResponse) => void) {
    chrome.tabs && chrome.tabs.query({
        active: true,
        currentWindow: true
    }, tabs => {
      chrome.tabs.sendMessage(
        tabs[0].id || 0,
        msg,
        callback
      );
    });
  }

  executeScript(func: () => void) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const id = tabs[0].id;
      if (id == null) return;

      chrome.scripting.executeScript({
        target: { tabId: id },
        func
      }, () => {});
    });
  }

  setInStorage(data: any) {
    chrome.storage.sync.set(data);
  }
}
