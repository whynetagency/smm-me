import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private firestore: AngularFirestore) {}

  getDetails(uid: string): Observable<any> {
    return this.firestore.collection('users').doc(uid).get();
  }

  updateUser(user) {
    return this.firestore.doc(`users/${user.id}`).update(user);
  }
}
