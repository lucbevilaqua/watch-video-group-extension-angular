import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, update, set } from "firebase/database";

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  app = initializeApp(environment.firebase);
  db = getDatabase(this.app);

  constructor() { }

  createRoom(roomId: string, room: any) {
    const roomRef = ref(this.db, 'rooms/' + roomId);

    set(roomRef, room);
  }

  observableRoom(roomId: string, callback: (snapshot: any) => void) {
    const roomRef = ref(this.db, 'rooms/' + roomId);

    onValue(roomRef, callback);
  }

  updateRoom(roomId: string, newValue: any) {
    const roomRef = ref(this.db, 'rooms/' + roomId);

    update(roomRef, newValue);
  }
}
