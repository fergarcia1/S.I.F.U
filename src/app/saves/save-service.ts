import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Saves } from '../models/saves';

@Injectable({ providedIn: 'root' })
export class SaveService {
  private readonly http = inject(HttpClient);

  saves = signal<Saves[]>([]);

  private url = 'http://localhost:3000/saves';

  loadAll(userId: number) {
    this.http.get<Saves[]>(`${this.url}?userId=${userId}`)
      .subscribe(res => this.saves.set(res));
  }

  create(save: Saves) {
    return this.http.post<Saves>(this.url, save);
  }

  delete(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }

  update(save: Saves) {
  return this.http.put<Saves>(`${this.url}/${save.id}`, save);
}
}
