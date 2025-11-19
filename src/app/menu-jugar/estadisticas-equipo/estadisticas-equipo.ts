import { Component, inject, signal } from '@angular/core';
import { GameStateService } from '../game-state-service';
import { Teams } from '../../models/teams';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-estadisticas-mi-equipo',
  templateUrl: './estadisticas-equipo.html',
})
export class EstadisticasEquipo {

  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute);
  protected readonly teamId = Number(this.route.snapshot.paramMap.get('id'));

  goBack(id : number) {
    this.router.navigateByUrl(`/inicio/${id}`);
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
