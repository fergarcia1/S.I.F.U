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

deletePlayerFromTeam(teamId: number, playerId: number): Observable<Teams> {
    const teamUrl = `${this.url}/${teamId}`;

    return this.http.get<Teams>(teamUrl).pipe(
      switchMap((team) => {
        // Filtramos el squad para quitar al jugador con ese ID
        const updatedSquad = team.squad.filter(p => p.id !== playerId);


        // Actualizamos el objeto team
        team.squad = updatedSquad;

        // Guardamos los cambios en el servidor
        return this.http.put<Teams>(teamUrl, team);
      }),
      catchError(error => {
        console.error('Error al eliminar jugador:', error);
        return throwError(() => new Error('No se pudo eliminar.'));
      })
    );
  }

  updatePlayer(teamId: number, updatedPlayer: Player): Observable<Teams> {
    const teamUrl = `${this.url}/${teamId}`;

    return this.http.get<Teams>(teamUrl).pipe(
      switchMap((team) => {
        // 1. Buscamos el índice del jugador en el array
        const index = team.squad.findIndex(p => p.id === updatedPlayer.id);

        if (index !== -1) {
          // 2. Reemplazamos el jugador viejo por el nuevo
          team.squad[index] = updatedPlayer;
          // 3. Guardamos el equipo actualizado
          return this.http.put<Teams>(teamUrl, team);
        } else {
          return throwError(() => new Error('Jugador no encontrado en este equipo'));
        }
      }),
      catchError(error => {
        console.error('Error al actualizar jugador:', error);
        return throwError(() => error);
      })
    );
  }

}


  



 






