import { Injectable, signal, computed } from '@angular/core';
import { Teams } from '../models/teams';
import { Match } from '../models/match';
import { LeagueStanding } from '../models/league-standing';

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
  private createInitialStandings(teams: Teams[]): LeagueStanding[] {
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

  // -----------------------------------------------------
  // RESULTADOS
  // -----------------------------------------------------
  updateMatchResult(matchId: number, homeGoals: number, awayGoals: number) {
    const updatedFixture = this.fixture().map(m => {
      if (m.id !== matchId) return m;

      return {
        ...m,
        homeGoals,
        awayGoals,
        played: true
      };
    });

    this.fixture.set(updatedFixture);
    this.recalculateStandings();
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
}
