import { Injectable } from '@angular/core';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { Teams } from '../models/teams';
import { Player } from '../models/player';
import { Observable, from, switchMap, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TeamsService {

  private col = collection(db, 'teams');

  getAllTeams(): Observable<Teams[]> {
    return from(getDocs(this.col)).pipe(
      map(snapshot => snapshot.docs.map(d => ({ ...d.data() } as Teams)))
    );
  }

  getTeamById(teamID: number): Observable<Teams> {
    const ref = doc(db, 'teams', String(teamID));
    return from(getDoc(ref)).pipe(
      map(snap => {
        if (!snap.exists()) throw new Error('Equipo no encontrado');
        return snap.data() as Teams;
      })
    );
  }

  addPlayerToTeam(teamId: number, newPlayer: Player): Observable<Teams> {
    const ref = doc(db, 'teams', String(teamId));
    return from(getDoc(ref)).pipe(
      switchMap(snap => {
        if (!snap.exists()) return throwError(() => new Error('Equipo no encontrado'));
        const team = snap.data() as Teams;
        team.squad.push(newPlayer);
        return from(updateDoc(ref, { squad: team.squad })).pipe(map(() => team));
      })
    );
  }

  updateTeam(updatedTeam: Teams): Observable<Teams> {
    const ref = doc(db, 'teams', String(updatedTeam.id));
    return from(updateDoc(ref, { ...updatedTeam })).pipe(
      map(() => updatedTeam)
    );
  }

  deletePlayerFromTeam(teamId: number, playerId: number): Observable<Teams> {
    const ref = doc(db, 'teams', String(teamId));
    return from(getDoc(ref)).pipe(
      switchMap(snap => {
        if (!snap.exists()) return throwError(() => new Error('Equipo no encontrado'));
        const team = snap.data() as Teams;
        team.squad = team.squad.filter(p => p.id !== playerId);
        return from(updateDoc(ref, { squad: team.squad })).pipe(map(() => team));
      })
    );
  }

  updatePlayer(teamId: number, updatedPlayer: Player): Observable<Teams> {
    const ref = doc(db, 'teams', String(teamId));
    return from(getDoc(ref)).pipe(
      switchMap(snap => {
        if (!snap.exists()) return throwError(() => new Error('Equipo no encontrado'));
        const team = snap.data() as Teams;
        const index = team.squad.findIndex(p => p.id === updatedPlayer.id);
        if (index === -1) return throwError(() => new Error('Jugador no encontrado'));
        team.squad[index] = updatedPlayer;
        return from(updateDoc(ref, { squad: team.squad })).pipe(map(() => team));
      })
    );
  }
}