import { LeagueStanding } from "./league-standing";
import { Match } from "./match";
import { Teams } from "./teams";

export interface Saves {
  id: number;
  userId: number; // a quién pertenece la partida
  teamId: number; // el equipo que el usuario dirige
  currentMatchday: number;
  standings: LeagueStanding[]; // tabla completa
  modifiedTeams: Teams[]; // planteles con stats actualizados por temporada
  fixture: Match[]; // ACÁ SE GUARDAN TODOS LOS PARTIDOS
  createdAt: string;
  updatedAt: string;
}
