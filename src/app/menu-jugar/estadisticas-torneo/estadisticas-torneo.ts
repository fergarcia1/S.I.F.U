import { Component, inject, signal } from '@angular/core';
import { GameStateService } from '../game-state-service';
import { Player } from '../../models/player';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-estadisticas-torneo',
  templateUrl: './estadisticas-torneo.html',
})
export class EstadisticasTorneo {

  private readonly gameState = inject(GameStateService);

  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute);
  protected readonly teamId = Number(this.route.snapshot.paramMap.get('id'));

  goBack(id : number) {
    this.router.navigateByUrl(`/inicio/${id}`);
  }

  topGoals = signal<Player[]>([]);
  topAssists = signal<Player[]>([]);
  topYellows = signal<Player[]>([]);
  topReds = signal<Player[]>([]);

  constructor() {
    const players: Player[] = this.gameState
      .teams()
      .flatMap(t => t.squad);

    this.topGoals.set(
      [...players].sort((a, b) => b.stats.goals - a.stats.goals).slice(0, 10)
    );

    this.topAssists.set(
      [...players].sort((a, b) => b.stats.assists - a.stats.assists).slice(0, 10)
    );

    this.topYellows.set(
      [...players].sort((a, b) => b.stats.yellowCards - a.stats.yellowCards).slice(0, 10)
    );

    this.topReds.set(
      [...players].sort((a, b) => b.stats.redCards - a.stats.redCards).slice(0, 10)
    );
  }
}
