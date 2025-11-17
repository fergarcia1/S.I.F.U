import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Teams } from '../models/teams';
import { Player } from '../models/player';
import { initialDB } from './mock-db';

// La variable global que simula la Base de Datos
let db: Teams[] = initialDB; 

@Injectable({
  providedIn: 'root'
})
export class DataService {

  // Genera un ID único para el nuevo equipo
  private generateUniqueTeamId(): number {
    const maxId = db.length > 0 ? Math.max(...db.map(t => t.id)) : 0;
    return maxId + 1;
  }
  
  // R (Read): Leer todos los equipos
  getTeams(): Observable<Teams[]> {
    return of(db); 
  }

  // C (Create / Alta): Crear un equipo
  addTeam(newTeamData: Omit<Teams, 'id' | 'squad'>): Observable<Teams> {
    const newTeam: Teams = { 
        id: this.generateUniqueTeamId(), 
        squad: [], 
        ...newTeamData 
    };
    db.push(newTeam);
    return of(newTeam);
  }

  // U (Update / Modificación): Modificar un equipo
  updateTeam(updatedTeam: Teams): Observable<Teams> {
    const index = db.findIndex(t => t.id === updatedTeam.id);
    if (index > -1) {
      // Reemplaza el equipo antiguo con el actualizado
      db[index] = updatedTeam; 
    }
    return of(updatedTeam);
  }

  // D (Delete / Baja): Eliminar un equipo
  deleteTeam(id: number): Observable<boolean> {
    const initialLength = db.length;
    // Filtra y actualiza la BD
    db = db.filter(t => t.id !== id);
    return of(db.length < initialLength); 
  }

  private generateUniquePlayerId(team: Teams): number {
    const allPlayerIds = team.squad.map(p => p.id);
    const maxGlobalPlayerId = allPlayerIds.length > 0 ? Math.max(...allPlayerIds) : 0;
    // Usamos 1000 para evitar colisiones con IDs de equipos (opcional)
    return maxGlobalPlayerId + 1 || team.id * 100 + 10; 
  }

  // --- OPERACIONES C.R.U.D. PARA JUGADORES ---

  // R (Read): Obtener un solo jugador
  getPlayer(teamId: number, playerId: number): Observable<Player | null> {
    const team = db.find(t => t.id === teamId);
    if (!team) return of(null);
    const player = team.squad.find(p => p.id === playerId);
    return of(player || null);
  }

  // C (Create / Alta): Agregar un jugador a un equipo
  addPlayerToTeam(teamId: number, newPlayerData: Omit<Player, 'id' | 'stats'>): Observable<Player | null> {
    const team = db.find(t => t.id === teamId);
    if (!team) return of(null);

    const newPlayer: Player = {
        id: this.generateUniquePlayerId(team),
        stats: { goals: 0, assists: 0, matches: 0, starts: 0, yellowCards: 0, redCards: 0 },
        ...newPlayerData
    };
    team.squad.push(newPlayer);
    return of(newPlayer);
  }

  // U (Update / Modificación): Modificar un jugador
  updatePlayer(teamId: number, updatedPlayer: Player): Observable<Player | null> {
    const team = db.find(t => t.id === teamId);
    if (!team) return of(null);

    const index = team.squad.findIndex(p => p.id === updatedPlayer.id);
    if (index > -1) {
        team.squad[index] = updatedPlayer;
        return of(updatedPlayer);
    }
    return of(null);
  }

  // D (Delete / Baja): Eliminar un jugador de un equipo
  deletePlayer(teamId: number, playerId: number): Observable<boolean> {
    const team = db.find(t => t.id === teamId);
    if (!team) return of(false);

    const initialLength = team.squad.length;
    team.squad = team.squad.filter(p => p.id !== playerId);
    return of(team.squad.length < initialLength);
  }
}