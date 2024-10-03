import {Injectable, NgZone} from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from 'firebase';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { take, map, tap } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { auth } from 'firebase/app';
import 'firebase/auth';
import {Router} from '@angular/router';

export interface UserCredentials {
  name: string;
  mobile: number;
  nickname: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: User = null;

  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFirestore,
    private storageService: StorageService,
    public router: Router,
    public ngZone: NgZone
  ) {
    this.afAuth.authState.subscribe(res => {
      this.user = res;
      if (this.user) {
        this.db.doc(`users/${this.currentUserId}`).valueChanges().pipe(
          tap((r: any) => {
            const user = r;
            user.id = this.currentUserId;
            this.storageService.set('userData', user);
            localStorage.setItem('user', JSON.stringify(user));
          })
        ).subscribe();
        this.storageService.set('user', this.user);
      } else {
        this.storageService.set('user', null);
      }
    });
  }

  get isLoggedIn(): boolean {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    return user !== null && user.emailVerified !== false;
  }

  get authenticated(): boolean {
    return this.user !== null;
  }

  get currentUser(): any {
    return this.authenticated ? this.user : null;
  }

  get currentUserId(): string {
    return this.authenticated ? this.user.uid : '';
  }

  signUp(credentials: UserCredentials) {
    return this.afAuth.createUserWithEmailAndPassword(credentials.email, credentials.password)
      .then((data) => this.db.doc(`users/${data.user.uid}`)
        .set({
          name: credentials.name,
          email: data.user.email,
          created: firebase.firestore.FieldValue.serverTimestamp()
        }).catch((error) => {
          window.alert(error.message);
        })).then(() => {
        this.ngZone.run(() => {
          this.router.navigate(['catalog']).then();
        });
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  SendVerificationMail() {
    return this.afAuth.currentUser.then(u => u.sendEmailVerification());
  }

  isEmailAvailable(name) {
    return this.db.collection('users', ref => ref.where('email', '==', name).limit(1)).valueChanges().pipe(
      take(1),
      map(user => user)
    );
  }

  signIn(credentials: UserCredentials) {
    return this.afAuth.signInWithEmailAndPassword(credentials.email, credentials.password);
  }

  signOut() {
    return this.afAuth.signOut();
  }

  resetPw(email) {
    return this.afAuth.sendPasswordResetEmail(email);
  }

  googleAuth() {
    // @ts-ignore
    return this.authLogin(new auth.GoogleAuthProvider()).then();
  }

  authLogin(provider: any) {
    return this.afAuth
      .signInWithPopup(provider)
      .then((data) => this.db.doc(`users/${data.user.uid}`)
        .set({
          // @ts-ignore
          name: data.additionalUserInfo.profile.name,
          // @ts-ignore
          email: data.additionalUserInfo.profile.email,
          created: firebase.firestore.FieldValue.serverTimestamp()
        }).catch((error) => {
          window.alert(error.message);
        }))
      .catch((error) => {
        window.alert(error);
      }).then(() => {
        this.ngZone.run(() => {
          this.router.navigate(['catalog']).then();
        });
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }
}
