import { Injectable } from '@angular/core';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../firebase.config';
import { Users } from '../models/users';
import { Observable, from, switchMap, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private toEmail(username: string): string {
    return `${username}@sifu.com`;
  }

  login(username: string, password: string): Observable<Users | null> {
    return from(signInWithEmailAndPassword(auth, this.toEmail(username), password)).pipe(
      switchMap(credential => {
        const userDoc = doc(db, 'users', credential.user.uid);
        return from(getDoc(userDoc)).pipe(
          switchMap(snap => {
            if (snap.exists()) {
              const userData = snap.data() as Users;
              localStorage.setItem('user', JSON.stringify(userData));
              return [userData];
            }
            // Solo llega acá si el usuario NO tiene documento en Firestore
            // Nunca va a ser admin ya que el admin se crea manualmente en Firestore
            const newUser: Users = {
              id: credential.user.uid,
              username,
              password: '',
              role: username === 'admin' ? 'admin' : 'player'
            };
            return from(setDoc(userDoc, newUser)).pipe(
              map(() => {
                localStorage.setItem('user', JSON.stringify(newUser));
                return newUser;
              })
            );
          })
        );
      })
    );
  }

  register(username: string, password: string): Observable<Users> {
    const q = query(collection(db, 'users'), where('username', '==', username));
    return from(getDocs(q)).pipe(
      switchMap(snapshot => {
        if (!snapshot.empty) {
          return throwError(() => 'El usuario ya existe');
        }
        return from(createUserWithEmailAndPassword(auth, this.toEmail(username), password)).pipe(
          switchMap(credential => {
            const newUser: Users = {
              id: credential.user.uid,
              username,
              password: '',
              role: 'player'
            };
            return from(setDoc(doc(db, 'users', credential.user.uid), newUser)).pipe(
              map(() => {
                localStorage.setItem('user', JSON.stringify(newUser));
                return newUser;
              })
            );
          })
        );
      })
    );
  }

  logout(): Observable<void> {
    localStorage.removeItem('user');
    return from(signOut(auth));
  }

  isLogged(): boolean {
    return !!localStorage.getItem('user');
  }

  getUser(): Users | null {
    return JSON.parse(localStorage.getItem('user') || 'null');
  }

  checkUserExists(username: string): Observable<boolean> {
    const q = query(collection(db, 'users'), where('username', '==', username));
    return from(getDocs(q)).pipe(
      map(snapshot => !snapshot.empty)
    );
  }
}