import { Component, computed, inject, signal } from '@angular/core';
import { TeamsService } from '../../equipos/teams-service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { Teams } from '../../models/teams';
import { Player } from '../../models/player';
import { GameStateService } from '../game-state-service';

@Component({
  selector: 'app-plantilla-component',
  imports: [RouterLink],
  templateUrl: './plantilla-component.html',
  styleUrl: './plantilla-component.css',
})
export class PlantillaComponent {
  private readonly service = inject(TeamsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute); 
  private readonly gameState = inject(GameStateService);

  protected readonly teamId = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly teamSource = signal<Teams | undefined>(undefined);
  private readonly location = inject(Location);

  constructor() {
    this.service.getTeamById(this.teamId).subscribe(team => {
      this.teamSource.set(team);
    });
  }
  public readonly team = computed(() => this.teamSource());
  public readonly squad = computed(() => this.teamSource()?.squad ?? []);
  public readonly isLoading = computed(() => this.teamSource() === undefined);

  titulares = computed(() =>
    this.ordenarPorPosicion(this.squad().filter(p => p.isStarter))
  );

  suplentes = computed(() =>
    this.ordenarPorPosicion(this.squad().filter(p => !p.isStarter))
  );

  jugadorSeleccionado: Player | null = null;

cambiarJugador(titular: Player, suplente: Player) {

  // 1️⃣ Actualizar el equipo local en el signal
  this.teamSource.update(team => {
    if (!team) return team;

    const newSquad = team.squad.map(p => {
      if (p.id === titular.id) return { ...p, isStarter: false };
      if (p.id === suplente.id) return { ...p, isStarter: true };
      return p;
    });

    return { ...team, squad: newSquad };
  });

  const updatedTeam = this.teamSource()!;

  // 2️⃣ Guardar en el backend
  this.service.updateTeam(updatedTeam).subscribe(() => {

    // 3️⃣ Muy importante: actualizar GameState
    this.gameState.updateTeam(updatedTeam);

    console.log("Titulares actualizados en GameState");
  });

  this.jugadorSeleccionado = null;
}






   goBack() {
    this.location.back();
  }

  private ordenarPorPosicion(jugadores: Player[]) {
    const orden = ['GK', 'DF', 'MF', 'FW'];

    return [...jugadores].sort(
      (a, b) => orden.indexOf(a.position!) - orden.indexOf(b.position!)
    );
  }

}


