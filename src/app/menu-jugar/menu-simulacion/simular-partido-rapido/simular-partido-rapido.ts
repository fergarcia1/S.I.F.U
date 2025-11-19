import { Component, inject, signal } from '@angular/core';
import { GameStateService } from '../../game-state-service';
import { Teams } from '../../../models/teams';
import { MatchEvent } from '../../../models/match-event';
import { simulateFullMatch } from '../../../utils/simulation';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-simular-partido-rapido',
  imports: [UpperCasePipe],
  templateUrl: './simular-partido-rapido.html',
  styleUrl: './simular-partido-rapido.css'
})
export class SimularPartidoRapido {

  events = signal<MatchEvent[]>([]);
  score = signal({ home: 0, away: 0 });
  protected readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly teamId = Number(this.route.snapshot.paramMap.get('id') ?? 0);
  private readonly location = inject(Location);
  match: any;
  homeTeam!: Teams;
  awayTeam!: Teams;

  constructor(private gameState: GameStateService) {
    
    const selectedTeamId = this.gameState.selectedTeamId()!;
    
    // 1. Obtener el partido del usuario
    this.match = this.getNextMatch(selectedTeamId);

    // Si no hay partido, cortamos
    if (!this.match) {
      console.warn("No hay próximo partido para este equipo.");
      return;
    }

    // 2. Simular toda la fecha (matchday)
    this.simulateMatchday(this.match.matchday);

    // 3. Obtener los equipos SOLO de tu partido
    this.homeTeam = this.gameState.getTeamById(this.match.homeTeamId)!;
    this.awayTeam = this.gameState.getTeamById(this.match.awayTeamId)!;

    // 4. Obtener el resultado que ya fue simulado en el paso anterior
    const updatedMatch = this.gameState.fixture().find(m => m.id === this.match.id)!;

    this.events.set(updatedMatch.events);
    this.score.set({
      home: updatedMatch.homeGoals,
      away: updatedMatch.awayGoals,
    });
  }

  // 🔥 SIMULAR TODOS LOS PARTIDOS DE UNA JORNADA
  private simulateMatchday(matchday: number) {

    const matches = this.gameState
      .fixture()
      .filter(m => m.matchday === matchday && !m.played);

    console.log("Simulando fecha:", matchday, matches);

    for (const match of matches) {

      const homeTeam = this.gameState.getTeamById(match.homeTeamId)!;
      const awayTeam = this.gameState.getTeamById(match.awayTeamId)!;

      const result = simulateFullMatch(match, homeTeam, awayTeam);

      this.gameState.updateMatchResult(match.id, result);
    }
  }

  getTeamById(teamId: number): Teams | undefined {
    return this.gameState.getTeamById(teamId);
  }

  getPlayerName(team: Teams | undefined, playerId: number): string {
    return (
      team?.squad.find((p) => p.id === playerId)?.name ?? 'Desconocido'
    );
  }

  private getNextMatch(teamId: number) {
    return (
      this.gameState
        .fixture()
        .find(
          (m) =>
            !m.played &&
            (m.homeTeamId === teamId || m.awayTeamId === teamId)
        )!
    );
  }
  goBack() {
    this.location.back();
  }
  navigateToMenuInicio(id : number) {
    this.router.navigateByUrl(`/inicio/${id}`);
  }
}
