import { Dt } from './dt';
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DtProfile } from '../models/dt-profile';

@Injectable({ providedIn: 'root' })
export class DtService {

  private http = inject(HttpClient);
  private url = 'http://localhost:3000/managers';


  profile = signal<DtProfile | null>(null);

  loadProfile(userId: number) {
    this.http.get<DtProfile>(`${this.url}/${userId}`)
      .subscribe(res => this.profile.set(res));
  }

  saveProfile(data: DtProfile) {
    return this.http.post<DtProfile>(this.url, data);
  }
}
