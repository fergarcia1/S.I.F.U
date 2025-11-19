import { Component, inject, signal } from '@angular/core';
import { GameStateService } from '../../game-state-service';
import { Teams } from '../../../models/teams';
import { MatchEvent } from '../../../models/match-event';
import { simulateFullMatch } from '../../../utils/simulation';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-simular-partido',
  templateUrl: './simular-partido.html',
})
export class SimularPartido {

  // 🔥 Estados reactivos
  events = signal<MatchEvent[]>([]);
  score = signal({ home: 0, away: 0 });
  currentMinute = signal(0);

  protected readonly route = inject(ActivatedRoute);
  protected readonly teamId = Number(this.route.snapshot.paramMap.get('id') ?? 0);

  match: any;
  homeTeam!: Teams;
  awayTeam!: Teams;

  private fullEvents: MatchEvent[] = []; // eventos completos para reproducir
  private intervalId: any;

  constructor(private gameState: GameStateService) {
    
    const selectedTeamId = this.gameState.selectedTeamId()!;
    
    // 1. Próximo partido del jugador
    this.match = this.getNextMatch(selectedTeamId);

    if (!this.match) return;

    // 2. Simular la fecha completa
    this.simulateMatchday(this.match.matchday);

    // 3. Extraer los equipos
    this.homeTeam = this.gameState.getTeamById(this.match.homeTeamId)!;
    this.awayTeam = this.gameState.getTeamById(this.match.awayTeamId)!;

    // 4. Obtener resultado simulado offline
    const updatedMatch = this.gameState.fixture().find(m => m.id === this.match.id)!;

    // 5. Guardar eventos completos
    this.fullEvents = [...updatedMatch.events];

    // 6. Iniciar animación del partido
    this.startRealTimeSimulation();
  }

  // 🎬 Simula minuto a minuto
  private startRealTimeSimulation() {
    let minute = 0;

    this.intervalId = setInterval(() => {
      minute++;
      this.currentMinute.set(minute);

      // Agregar eventos que ocurren en este minuto
      const eventsNow = this.fullEvents.filter(e => e.minute === minute);

      if (eventsNow.length > 0) {
        this.events.set([...this.events(), ...eventsNow]);

        // actualizar marcador
        for (const ev of eventsNow) {
          if (ev.type === 'goal') {
            if (ev.teamId === this.homeTeam.id) {
              this.score.update(s => ({ home: s.home + 1, away: s.away }));
            } else {
              this.score.update(s => ({ home: s.home, away: s.away + 1 }));
            }
          }
        }
      }

      // Terminar en 90
      if (minute >= 90) {
        clearInterval(this.intervalId);
      }

    }, 300); // velocidad (300ms por minuto)
  }

  // 🔥 Simula toda la jornada
  private simulateMatchday(matchday: number) {
    const matches = this.gameState
      .fixture()
      .filter(m => m.matchday === matchday && !m.played);

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
    return team?.squad.find((p) => p.id === playerId)?.name ?? 'Desconocido';
  }

  private getNextMatch(teamId: number) {
    return this.gameState
      .fixture()
      .find(m => !m.played && (m.homeTeamId === teamId || m.awayTeamId === teamId))!;
  }
}
