import { Component, inject, signal, computed } from '@angular/core';
import { GameStateService } from '../../game-state-service';
import { simulateFullMatchRealTime } from '../../../utils/simulation';
import { MatchEvent } from '../../../models/match-event';

@Component({
  selector: 'app-simular-partido',
  templateUrl: './simular-partido.html',
})
export class SimularPartido {
  private gameState = inject(GameStateService);

  protected readonly fixture = computed(() => this.gameState.getState()?.fixture ?? []);
  protected readonly teams = computed(() => this.gameState.getState()?.teams ?? []);

  protected currentMatchIndex = signal(0);
  protected homeGoals = signal(0);
  protected awayGoals = signal(0);
  protected events = signal<MatchEvent[]>([]);
  protected minute = signal(0);

  protected readonly currentMatch = computed(() => this.fixture()[this.currentMatchIndex()] ?? null);
  protected readonly homeTeam = computed(() => this.teams().find(t => t.id === this.currentMatch()?.homeTeamId));
  protected readonly awayTeam = computed(() => this.teams().find(t => t.id === this.currentMatch()?.awayTeamId));

  protected readonly eventsText = computed(() =>
    this.events().map(e => `${e.minute}' ${e.type} (Jugador ${e.playerId})`).join(', ')
  );

  private simulationRunning = false;

  protected simulateRealTime() {
    if (!this.currentMatch() || !this.homeTeam() || !this.awayTeam() || this.simulationRunning) return;

    this.simulationRunning = true;
    this.events.set([]);
    this.homeGoals.set(0);
    this.awayGoals.set(0);
    this.minute.set(0);

    simulateFullMatchRealTime(
      this.currentMatch()!,
      this.homeTeam()!,
      this.awayTeam()!,
      (evs, min, score) => {
        this.minute.set(min);
        this.homeGoals.set(score.home);
        this.awayGoals.set(score.away);
        this.events.set([...this.events(), ...evs]);
      },
      (result) => {
        this.homeGoals.set(result.homeGoals);
        this.awayGoals.set(result.awayGoals);
        this.events.set(result.events);
        this.simulationRunning = false;
      }
    );
  }

  protected nextMatch() {
    this.currentMatchIndex.set(this.currentMatchIndex() + 1);
    this.homeGoals.set(0);
    this.awayGoals.set(0);
    this.events.set([]);
    this.minute.set(0);
    this.simulationRunning = false;
  }
}
