import { Injectable, signal, computed } from '@angular/core';
import { Teams } from '../models/teams';
import { Match } from '../models/match';
import { LeagueStanding } from '../models/league-standing';
import { MatchEvent } from '../models/match-event';
import { Player } from '../models/player';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {

  // --- STATE BASE ---
  readonly selectedTeamId = signal<number | null>(null);
  readonly teams = signal<Teams[]>([]);
  readonly fixture = signal<Match[]>([]);
  readonly standings = signal<LeagueStanding[]>([]);

  // --- Helper: equipo seleccionado ---
  readonly selectedTeam = computed(() =>
    this.teams().find(t => t.id === this.selectedTeamId())
  );

  // -----------------------------------------------------
  // NUEVA PARTIDA
  // -----------------------------------------------------
  startNewGame(data: {
    selectedTeamId: number;
    teams: Teams[];
    fixture: Match[];
  }) {
    this.selectedTeamId.set(data.selectedTeamId);
    this.teams.set(data.teams);
    this.fixture.set(data.fixture);
    this.standings.set(this.createInitialStandings(data.teams));
  }

  // -----------------------------------------------------
  // TABLA INICIAL
  // -----------------------------------------------------
  createInitialStandings(teams: Teams[]): LeagueStanding[] {
    return teams.map(t => ({
      teamId: t.id,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0
    }));
  }

updatePlayerStats(players: Player[], events: MatchEvent[]) {
  // Partidos jugados y titularidad
  players.forEach(player => {
    player.stats.matches++;
    if (player.isStarter) player.stats.starts++;
  });

  // Goles y asistencias segun eventos
  events.forEach(ev => {
    const player = players.find(p => p.id === ev.playerId);
    if (!player) return;

    switch (ev.type) {
      case 'goal':
        player.stats.goals++;
        break;
      // 🔴 IMPORTANTE: NO tocamos yellow ni red acá
      // case 'yellow': player.stats.yellowCards++; break;
      // case 'red': player.stats.redCards++; break;
    }

    // Asistencias desde assistId del evento de gol
    if (ev.assistId) {
      const assistPlayer = players.find(p => p.id === ev.assistId);
      if (assistPlayer) assistPlayer.stats.assists++;
    }
  });
}


  // -----------------------------------------------------
  // RESULTADOS
  // -----------------------------------------------------
  updateMatchResult(
  matchId: number, 
  result: { homeGoals: number; awayGoals: number; events: MatchEvent[] }
) {
  const updatedFixture = this.fixture().map(m => {
    if (m.id !== matchId) return m;

    return {
      ...m,
      homeGoals: result.homeGoals,
      awayGoals: result.awayGoals,
      events: result.events,
      played: true
    };
  });

  this.fixture.set(updatedFixture);
  this.recalculateStandings();

  // Actualizar estadísticas de los jugadores de ambos equipos
  const match = this.fixture().find(m => m.id === matchId);
  if (!match) return;

  const homeTeam = this.getTeamById(match.homeTeamId);
  const awayTeam = this.getTeamById(match.awayTeamId);

  if (homeTeam) this.updatePlayerStats(homeTeam.squad, result.events);
  if (awayTeam) this.updatePlayerStats(awayTeam.squad, result.events);
}



  // -----------------------------------------------------
  // RECONSTRUIR TABLA DESDE CERO
  // -----------------------------------------------------
  private recalculateStandings() {
    const table = this.standings().map(row => ({
      ...row,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0
    }));

    const findRow = (teamId: number) =>
      table.find(r => r.teamId === teamId)!;

    for (const match of this.fixture()) {
      if (!match.played) continue;

      const home = findRow(match.homeTeamId);
      const away = findRow(match.awayTeamId);

      home.played++;
      away.played++;

      home.goalsFor += match.homeGoals;
      home.goalsAgainst += match.awayGoals;

      away.goalsFor += match.awayGoals;
      away.goalsAgainst += match.homeGoals;

      if (match.homeGoals > match.awayGoals) {
        home.wins++;
        home.points += 3;
        away.losses++;
      } else if (match.homeGoals < match.awayGoals) {
        away.wins++;
        away.points += 3;
        home.losses++;
      } else {
        home.draws++;
        away.draws++;
        home.points++;
        away.points++;
      }
    }

    this.standings.set(table);
  }

  // -----------------------------------------------------
  // OBTENER ESTADO COMPLETO (OPCIONAL)
  // -----------------------------------------------------
  getState() {
    return {
      selectedTeamId: this.selectedTeamId(),
      teams: this.teams(),
      fixture: this.fixture(),
      standings: this.standings()
    };
  }

  getTeamById(teamId: number): Teams | undefined {
    return this.teams().find(t => t.id === teamId);
  }

 updateTeam(updatedTeam: Teams) {
  const newTeams = this.teams().map(team => {
    if (team.id !== updatedTeam.id) return team;

    const newSquad = team.squad.map(originalPlayer => {
      const updatedPlayer = updatedTeam.squad.find(p => p.id === originalPlayer.id);

      if (!updatedPlayer) return originalPlayer;

      return {
        ...originalPlayer,          // ← conserva stats acumulados
        isStarter: updatedPlayer.isStarter  // ← solo cambia el titular
      };
    });

    return { ...team, squad: newSquad };
  });

  this.teams.set(newTeams);
}


  

}
