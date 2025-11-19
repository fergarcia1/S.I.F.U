import { Component, inject, signal } from '@angular/core';
import { GameStateService } from '../game-state-service';
import { Teams } from '../../models/teams';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-estadisticas-mi-equipo',
  imports: [RouterLink],
  templateUrl: './estadisticas-equipo.html',
  styleUrls: ['./estadisticas-equipo.css']
})
export class EstadisticasEquipo {

  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute);
  protected readonly teamId = Number(this.route.snapshot.paramMap.get('id'));
  private readonly location = inject(Location);
  
   goBack() {
    this.location.back();
  }

  private readonly gameState = inject(GameStateService);

  team = signal<Teams | null>(null);

  constructor() {
    const id = this.gameState.selectedTeamId();
    if (!id) return;

    const t = this.gameState.getTeamById(id);
    this.team.set(t ?? null);
  }
}
