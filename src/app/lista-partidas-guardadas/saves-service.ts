import { Injectable } from '@angular/core';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { Observable, from, map } from 'rxjs';
import { Saves } from '../models/saves';

@Injectable({
  providedIn: 'root'
})
export class SavesService {

  private col = collection(db, 'saves');

  createSave(newSave: Saves): Observable<Saves> {
    return from(addDoc(this.col, { ...newSave })).pipe(
      map(ref => ({ ...newSave, id: ref.id as any }))
    );
  }

  updateSave(save: Saves): Observable<Saves> {
    const ref = doc(db, 'saves', String(save.id));
    return from(updateDoc(ref, { ...save })).pipe(
      map(() => save)
    );
  }

  getSaveById(id: number): Observable<Saves> {
    const ref = doc(db, 'saves', String(id));
    return from(getDoc(ref)).pipe(
      map(snap => ({ id: snap.id, ...snap.data() } as any))
    );
  }

  getSavesByUserId(userId: string): Observable<Saves[]> {
    const q = query(this.col, where('userId', '==', String(userId)));
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any)))
    );
  }

  deleteSave(id: number): Observable<void> {
    const ref = doc(db, 'saves', String(id));
    return from(deleteDoc(ref));
  }
}