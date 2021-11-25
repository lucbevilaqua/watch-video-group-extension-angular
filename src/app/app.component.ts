import { Component } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/compat/database';
import { ChromeApiService } from './services/chrome-api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  roomId: string;
  itemRef: AngularFireObject<any>;
  hasActiveRoom = false;

  constructor(private chromeApi: ChromeApiService, private db: AngularFireDatabase) { }

  createRoom() {
    this.chromeApi.roomId = (Math.random() + 1).toString(36).substring(7);
    // this.chromeApi.setInStorage({ roomId: this.chromeApi.roomId });

    this.itemRef = this.db.object(this.chromeApi.roomId);
    this.itemRef.set({ pause: true, link: window.location.href });
    this.entryRoom();
  }

  entryRoom() {
    this.itemRef.snapshotChanges().subscribe((value: any) => {
      const newValue = value.payload?.val();
      this.changeStatusVideo(newValue?.pause ? 'pause' : 'play');
    });
  }

  getRoom() {
    this.itemRef = this.db.object(this.chromeApi.roomId ?? this.roomId);
    this.entryRoom();
  }

  changeStatusVideo(status: 'play' | 'pause') {
    // this.chromeApi.executeScript(`document.querySelector(\'video\')['${status}']();`);
  }
}
