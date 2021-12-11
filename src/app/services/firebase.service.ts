import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, update, set, remove } from "firebase/database";

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  app = initializeApp(environment.firebase);
  db = getDatabase(this.app);

  constructor() { }

  getRef = (roomId: string) => ref(this.db, 'rooms/' + roomId)

  createRoom(roomId: string, room: any) {
    const roomRef = this.getRef(roomId);

    set(roomRef, room);
  }

  removeRoom(roomId: string) {
    const roomRef = this.getRef(roomId);

    remove(roomRef);
  }

  observableRoom(roomId: string, callback: (snapshot: any) => void) {
    const roomRef = this.getRef(roomId);

    return onValue(roomRef, callback);
  }

  updateRoom(roomId: string, newValue: any) {
    const roomRef = this.getRef(roomId);

    update(roomRef, newValue);
  }
}
