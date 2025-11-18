import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Users } from '../models/users';
import { Observable, map, switchMap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/users';
  private loggedUser?: Users;

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<Users | null> {
    return this.http.get<Users[]>(`${this.apiUrl}?username=${username}&password=${password}`)
      .pipe(
        map(users => {
          if (users.length > 0) {
            this.loggedUser = users[0];
            localStorage.setItem('user', JSON.stringify(this.loggedUser));
            return users[0];
          }
          return null;
        })
      );
  }

  logout() {
    this.loggedUser = undefined;
    localStorage.removeItem('user');
  }

  isLogged(): boolean {
    return !!localStorage.getItem('user');
  }

  getUser(): Users | null {
    return JSON.parse(localStorage.getItem('user') || 'null');
  }
  checkUserExists(username: string) {
    return this.http.get<Users[]>(`${this.apiUrl}?username=${username}`);
  }

  register(username: string, password: string) {
  return this.http.get<Users[]>(`${this.apiUrl}?username=${username}`).pipe(
    switchMap(users => {
      if (users.length > 0) {
        return throwError(() => 'El usuario ya existe');
      }

      const newUser: Users = {
        id: Date.now(), // genera ID unico
        username,
        password,
        role: 'player'  
      };

      return this.http.post<Users>(this.apiUrl, newUser);
    })
  );
}
}