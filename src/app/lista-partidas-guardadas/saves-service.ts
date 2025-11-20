import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Saves } from '../models/saves'; 

@Injectable({
  providedIn: 'root'
})
export class SavesService {
  private readonly url = 'http://localhost:3000/saves'; 
  private readonly http = inject(HttpClient);

  
  createSave(newSave: Saves): Observable<Saves> {
    return this.http.post<Saves>(this.url, newSave);
  }

 
  updateSave(save: Saves): Observable<Saves> {
    return this.http.put<Saves>(`${this.url}/${save.id}`, save);
  }

  
  getSaveById(id: number): Observable<Saves> {
    return this.http.get<Saves>(`${this.url}/${id}`);
  }

  getSavesByUserId(userId: number): Observable<Saves[]> {
    return this.http.get<Saves[]>(`${this.url}?userId=${userId}`);
  }

  deleteSave(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

}