import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  printMessage() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const id = tabs[0].id;
      if (id == null) return;
      chrome.tabs.executeScript(id, {
        code: 'console.log(\'ola\')',
      });
    });
  }
}
