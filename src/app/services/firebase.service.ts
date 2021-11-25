import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, update } from "firebase/database";
import { ChromeApiService } from './chrome-api.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  chromeApiService = new ChromeApiService();
  app = initializeApp(environment.firebase);
  db = getDatabase(this.app);

  constructor() { }

  observableRoom(roomId: string, callback: (snapshot: any) => void) {
    const roomRef = ref(this.db, 'rooms/' + roomId);

    onValue(roomRef, callback);
  }

  updateRoom(roomId: string, newValue: any) {
    const roomRef = ref(this.db, 'rooms/' + roomId);

    update(roomRef, newValue);
  }
}
