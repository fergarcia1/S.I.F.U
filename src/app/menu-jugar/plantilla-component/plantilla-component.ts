import { Component, computed, inject, signal } from '@angular/core';
import { TeamsService } from '../../equipos/teams-service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { Teams } from '../../models/teams';
import { Player } from '../../models/player';
import { GameStateService } from '../game-state-service';

const VALID_FORMATIONS = [
  '3-4-3', '3-5-2',
  '4-2-4', '4-3-3', '4-4-2', '4-5-1',
  '5-2-3', '5-3-2', '5-4-1'
];

@Component({
  selector: 'app-plantilla-component',
  imports: [RouterLink],
  templateUrl: './plantilla-component.html',
  styleUrl: './plantilla-component.css',
})
export class PlantillaComponent {
  //servicios y rutas
  private readonly service = inject(TeamsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute); 
  private readonly gameState = inject(GameStateService);

  //id del equipo seleccionado
  protected readonly teamId = Number(this.route.snapshot.paramMap.get('id'));

  //signal del equipo y isLoading
  protected readonly teamSource = signal<Teams | undefined>(undefined);
   public readonly team = computed(() => this.teamSource());
  public readonly squad = computed(() => this.teamSource()?.squad ?? []);
  public readonly isLoading = computed(() => this.teamSource() === undefined);

  //location para el boton de volver
  private readonly location = inject(Location);

  // mostrar errores de tactica
  errorMessage = signal<string | null>(null);

  //signals para formacion
  currentFormation = computed(() => {
    const df = this.titulares().filter(p => p.position === 'DF').length;
    const mf = this.titulares().filter(p => p.position === 'MF').length;
    const fw = this.titulares().filter(p => p.position === 'FW').length;
    return `${df}-${mf}-${fw}`; // retorna formacion
  });

  //signals para visualizacion en "campito"
  viewGK = computed(() => this.titulares().filter(p => p.position === 'GK'));
  viewDF = computed(() => this.titulares().filter(p => p.position === 'DF'));
  viewMF = computed(() => this.titulares().filter(p => p.position === 'MF'));
  viewFW = computed(() => this.titulares().filter(p => p.position === 'FW'));

  constructor() {
    this.service.getTeamById(this.teamId).subscribe(team => {
      this.teamSource.set(team);
    });
  }

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


private esFormacionValida(titularSaliente: Player, suplenteEntrante: Player): boolean {
    // Creamos una lista hipotética de cómo quedarían los titulares
    const nuevosTitulares: Player[] = this.titulares()
      .filter((p: Player) => p.id !== titularSaliente.id) // Sacamos al titular
      .concat(suplenteEntrante);                // Agregamos al suplente

    // Contamos cuántos hay de cada posición en esa nueva lista
    const gk = nuevosTitulares.filter(p => p.position === 'GK').length;
    const df = nuevosTitulares.filter(p => p.position === 'DF').length;
    const mf = nuevosTitulares.filter(p => p.position === 'MF').length;
    const fw = nuevosTitulares.filter(p => p.position === 'FW').length;

    // REGLA 1: Arquero (Exactamente 1)
    if (gk !== 1) {
      this.errorMessage.set("El equipo debe tener exactamente 1 Arquero.");
      return false;
    }

    // REGLA 2: Defensores (Min 3, Max 5)
    if (df < 3 || df > 5) {
      this.errorMessage.set(`Formación inválida: Defensores permitidos entre 3 y 5 (Tendrias ${df}).`);
      return false;
    }

    // REGLA 3: Mediocampistas (Min 2, Max 5)
    if (mf < 2 || mf > 5) {
      this.errorMessage.set(`Formación inválida: Mediocampistas permitidos entre 2 y 5 (Tendrias ${mf}).`);
      return false;
    }

    // REGLA 4: Delanteros (Min 1, Max 4)
    if (fw < 1 || fw > 4) {
      this.errorMessage.set(`Formación inválida: Delanteros permitidos entre 1 y 4 (Tendrias ${fw}).`);
      return false;
    }

    const formacionResultante = `${df}-${mf}-${fw}`;

    // Verificamos si existe en la lista permitida
    if (!VALID_FORMATIONS.includes(formacionResultante)) {
      this.errorMessage.set(`⚠️ Formación inválida (${formacionResultante}). Solo se permiten: ${VALID_FORMATIONS.join(', ')}`);
      return false;
    }

    return true;
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
  getTeamLogo(teamId: number): string {
    return `/logos/${teamId}.png`;
  }
  handleMissingImage(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/logos/default.png'; 
  }

}


