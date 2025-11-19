import { Component, inject, signal, computed } from '@angular/core';
import { GameStateService } from '../../game-state-service';
import { simulateFullMatch } from '../../../utils/simulation';
import { MatchEvent } from '../../../models/match-event';

@Component({
  selector: 'app-simular-partido-rapido',
  templateUrl: './simular-partido-rapido.html',
})
export class SimularPartidoRapido {
  private gameState = inject(GameStateService);

  protected readonly fixture = computed(() => this.gameState.getState()?.fixture ?? []);
  protected readonly teams = computed(() => this.gameState.getState()?.teams ?? []);

  protected currentMatchIndex = signal(0);
  protected homeGoals = signal(0);
  protected awayGoals = signal(0);
  protected events = signal<MatchEvent[]>([]);

  protected readonly currentMatch = computed(() => this.fixture()[this.currentMatchIndex()] ?? null);
  protected readonly homeTeam = computed(() => this.teams().find(t => t.id === this.currentMatch()?.homeTeamId));
  protected readonly awayTeam = computed(() => this.teams().find(t => t.id === this.currentMatch()?.awayTeamId));

  // 🔹 Computed para mostrar eventos como texto
  protected readonly eventsText = computed(() =>
    this.events().map(e => `${e.minute}' ${e.type} (Jugador ${e.playerId})`).join(', ')
  );

  protected simulateFast() {
    if (!this.currentMatch() || !this.homeTeam() || !this.awayTeam()) return;
    const result = simulateFullMatch(this.currentMatch()!, this.homeTeam()!, this.awayTeam()!);
    this.homeGoals.set(result.homeGoals);
    this.awayGoals.set(result.awayGoals);
    this.events.set(result.events);
  }

  protected nextMatch() {
    this.currentMatchIndex.set(this.currentMatchIndex() + 1);
    this.homeGoals.set(0);
    this.awayGoals.set(0);
    this.events.set([]);
  }
}
