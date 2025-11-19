import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
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
  updateTeam(team: Teams) {
    // Enviamos el equipo modificado a la URL: localhost:3000/teams/ID
    return this.http.put<Teams>(`${this.url}/${team.id}`, team);
  }
}
