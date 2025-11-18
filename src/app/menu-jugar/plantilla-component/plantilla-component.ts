import { Component, computed, inject, signal } from '@angular/core';
import { TeamsService } from '../../equipos/teams-service';
import { ActivatedRoute, Router } from '@angular/router';
import { Teams } from '../../models/teams';
import { Player } from '../../models/player';

@Component({
  selector: 'app-plantilla-component',
  imports: [],
  templateUrl: './plantilla-component.html',
  styleUrl: './plantilla-component.css',
})
export class PlantillaComponent {
  private readonly service = inject(TeamsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly teamId = Number(this.route.snapshot.paramMap.get('id'));

  // 1️⃣ WritableSignal (sí permite update/set)
  protected readonly teamSource = signal<Teams | undefined>(undefined);

  constructor() {
    // 2️⃣ Cargar equipo en el signal
    this.service.getTeamById(this.teamId).subscribe(team => {
      this.teamSource.set(team);
    });
  }

  // 3️⃣ Computeds de lectura
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

  // 4️⃣ Intercambio que SÍ actualiza los signals
  cambiarJugador(titular: Player, suplente: Player) {
    this.teamSource.update(team => {
      if (!team) return team;

      const newSquad = team.squad.map(p => {
        if (p.id === titular.id) return { ...p, isStarter: false };
        if (p.id === suplente.id) return { ...p, isStarter: true };
        return p;
      });

      return { ...team, squad: newSquad };
    });

    this.jugadorSeleccionado = null;
  }

  private ordenarPorPosicion(jugadores: Player[]) {
    const orden = ['GK', 'DF', 'MF', 'FW'];

    return [...jugadores].sort(
      (a, b) => orden.indexOf(a.position) - orden.indexOf(b.position)
    );
  }

}

