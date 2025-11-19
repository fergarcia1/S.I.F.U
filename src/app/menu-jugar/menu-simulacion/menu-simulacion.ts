import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { PlantillaComponent } from '../plantilla-component/plantilla-component';
import { GameStateService } from '../game-state-service';
import { Teams } from '../../models/teams';



@Component({
  selector: 'app-menu-simulacion',
  imports: [CommonModule, PlantillaComponent],
  templateUrl: './menu-simulacion.html',
  styleUrl: './menu-simulacion.css',
})

export class MenuSimulacion {

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private gameState = inject(GameStateService);

  protected readonly teamId = Number(this.route.snapshot.paramMap.get('id') ?? 0);
  private readonly location = inject(Location);



  // Obtenemos el equipo seleccionado del estado del juego
  protected team = signal<Teams | undefined>(undefined);

  // Computeds para separar jugadores por línea (Igual que en Plantilla)
  viewGK = computed(() => this.team()?.squad.filter(p => p.isStarter && p.position === 'GK') ?? []);
  viewDF = computed(() => this.team()?.squad.filter(p => p.isStarter && p.position === 'DF') ?? []);
  viewMF = computed(() => this.team()?.squad.filter(p => p.isStarter && p.position === 'MF') ?? []);
  viewFW = computed(() => this.team()?.squad.filter(p => p.isStarter && p.position === 'FW') ?? []);

  // Computed para mostrar el esquema (ej: "4-3-3")
  currentFormation = computed(() => {
    if (!this.team()) return '...';
    const df = this.viewDF().length;
    const mf = this.viewMF().length;
    const fw = this.viewFW().length;
    return `${df}-${mf}-${fw}`;
  });

  constructor() {
    const teamId = this.gameState.selectedTeamId();
    if (teamId) {
      const t = this.gameState.getTeamById(teamId);
      this.team.set(t);
    }
  }

  goBack() {
    this.location.back();
  }
  navigateToSimulacionPartido(id: number) {
    this.router.navigateByUrl(`/simulacionPartido/${id}`);
  }
  navigateToSimulacionPartidoRapido(id: number) {
    this.router.navigateByUrl(`/simulacionPartidoRapido/${id}`);
  }
}