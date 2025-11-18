import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
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
}



// .pipe(
//         map(team => team.squad ?? [])
//       )
