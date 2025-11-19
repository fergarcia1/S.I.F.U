import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Teams } from '../models/teams';
import { Player } from '../models/player';
import { TeamsSelectionComponent } from './teams-selection-component/teams-selection-component'; 
import { Observable, throwError } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class TeamsService {
  private readonly url = 'http://localhost:3000/teams'
  private readonly http = inject(HttpClient)
  private readonly teams = signal<Teams[]>([]);

  getAllTeams(): Observable<Teams[]> {
    return this.http.get<Teams[]>(this.url).pipe(
      catchError(error => {
        console.error('Error al obtener la lista de Equipos:', error);
        return throwError(() => new Error('Error en el servicio.'));
      })
    );
  }
  getTeamById(teamID: number) {
    return this.http.get<Teams>(`${this.url}/${teamID}`).pipe(
      catchError(error => {
        console.error(`Error al obtener el equipo con ID ${teamID}:`, error);
        return throwError(() => new Error('No se pudo encontrar el equipo.'));
      })
    )
  }

addPlayerToTeam(teamId: number, newPlayer: Player): Observable<Teams> {
    const teamUrl = `${this.url}/${teamId}`;

    // Usamos switchMap para encadenar operaciones dependientes
    return this.http.get<Teams>(teamUrl).pipe(
      switchMap((team) => {
        // Agregamos el jugador al array localmente
        team.squad.push(newPlayer);
        
        // Enviamos el equipo modificado al servidor
        return this.http.put<Teams>(teamUrl, team);
      }),
      catchError(error => {
        console.error('Error al agregar jugador:', error);
        return throwError(() => new Error('No se pudo guardar el jugador.'));
      })
    );
  }
  
  updateTeam(updatedTeam: Teams): Observable<Teams> {
  const teamUrl = `${this.url}/${updatedTeam.id}`;

  return this.http.put<Teams>(teamUrl, updatedTeam).pipe(
    map(savedTeam => {

      // Actualizamos el listado local de equipos (signal)
      const newTeams = this.teams().map(t =>
        t.id === savedTeam.id ? savedTeam : t
      );

      this.teams.set(newTeams);

      return savedTeam;
    }),
    catchError(error => {
      console.error('Error al actualizar equipo:', error);
      return throwError(() => new Error('No se pudo actualizar el equipo.'));
    })
  );
}


}

