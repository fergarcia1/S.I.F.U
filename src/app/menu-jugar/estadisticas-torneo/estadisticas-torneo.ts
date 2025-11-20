import { Component, inject, signal } from '@angular/core';
import { GameStateService } from '../game-state-service';
import { Player } from '../../models/player';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-estadisticas-torneo',
  imports: [RouterLink],
  templateUrl: './estadisticas-torneo.html',
  styleUrl: './estadisticas-torneo.css'
})
export class EstadisticasTorneo {

  private readonly gameState = inject(GameStateService);

  private readonly route = inject(ActivatedRoute);
  protected readonly teamId = Number(this.route.snapshot.paramMap.get('id'));
  private readonly location = inject(Location);

  goBack() {
    this.location.back();
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
