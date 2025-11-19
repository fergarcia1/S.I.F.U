import { Component, computed, inject } from '@angular/core';
import { Location } from '@angular/common';
import { TeamsService } from '../../equipos/teams-service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth-service';
import { GameStateService } from '../game-state-service';
import { SaveActualService } from '../../saves/save-actual-service';

@Component({
  selector: 'app-inicio-component',
  imports: [RouterLink],
  templateUrl: './inicio-component.html',
  styleUrl: './inicio-component.css',
})
export class InicioComponent {

  private readonly service = inject(TeamsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly location = inject(Location);
  private readonly currentSave = inject(SaveActualService);
  private readonly gameState = inject(GameStateService);


  protected readonly teamId = this.gameState.selectedTeamId();

  protected readonly teams = computed(() => this.gameState.getState()?.teams ?? []);



  constructor() {
    this.initialize();
  }

  private initialize() {
    const save = this.currentSave.currentSave();

    // ⭐ SI HAY UNA PARTIDA CARGADA → restaura el GameState y no hace más nada
    if (save) {
      console.log("Cargando partida guardada");

      this.gameState.selectedTeamId.set(save.teamId);
      this.gameState.teams.set(save.modifiedTeams);
      this.gameState.fixture.set(save.fixture);
      this.gameState.standings.set(save.standings);

      return; // ⬅ EVITA QUE se genere un nuevo estado
    }

    // ⭐ Si no hay partida cargada, significa que venís de Nueva Partida.
    // En ese caso, TeamsSelectionComponent ya generó el GameState.
    console.log("InicioComponent cargado desde NUEVA PARTIDA");
  }

  navigateToMenuSimulacion(id: number) {
    this.router.navigateByUrl(`/menuSimulacion/${id}`);
  }

  navigateToMenuPrincipal() {
    this.router.navigateByUrl(`/menu`)
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  protected readonly nextMatch = computed(() => {
    const fixture = this.gameState.fixture();
    const teams = this.gameState.teams();
    const myTeamId = this.teamId;

    if (!fixture.length) return null;

    // Buscar el siguiente partido NO jugado donde participe este equipo
    const next = fixture
      .filter(m => !m.played && (m.homeTeamId === myTeamId || m.awayTeamId === myTeamId))
      .sort((a, b) => a.matchday - b.matchday)[0]; // el más cercano

    if (!next) return null;

    // Rival
    const rivalTeamId = next.homeTeamId === myTeamId ? next.awayTeamId : next.homeTeamId;
    const rivalTeam = teams.find(t => t.id === rivalTeamId);

    return {
      matchday: next.matchday,
      rivalTeamName: rivalTeam?.name ?? "Rival desconocido",
      rivalTeamId,
      isHome: next.homeTeamId === myTeamId
    };
  });

  protected readonly nextMatchStandingInfo = computed(() => {
    const next = this.nextMatch();
    if (!next) return null;

    const standings = [...this.gameState.standings()];
    const teams = this.gameState.teams();

    // ORDEN REAL de tabla (igual al de TablaComponent)
    standings.sort((a, b) => {
      // 1) Puntos
      if (b.points !== a.points) return b.points - a.points;

      // 2) Diferencia de gol
      const dgA = a.goalsFor - a.goalsAgainst;
      const dgB = b.goalsFor - b.goalsAgainst;
      if (dgB !== dgA) return dgB - dgA;

      // 3) Goles a favor
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;

      // 4) Nombre alfabético
      const nameA = teams.find(t => t.id === a.teamId)?.name ?? '';
      const nameB = teams.find(t => t.id === b.teamId)?.name ?? '';

      return nameA.localeCompare(nameB);
    });

    // POSICIONES REALES SEGÚN ESE ORDEN
    const myPos = standings.findIndex(s => s.teamId === this.teamId) + 1;
    const rivalPos = standings.findIndex(s => s.teamId === next.rivalTeamId) + 1;

    return { myPos, rivalPos };
  });


  protected readonly myTeamName = computed(() => {
    return this.teams().find(t => t.id === this.teamId)?.name ?? '';
  });

  protected readonly isSeasonFinished = computed(() => {
    const fixture = this.gameState.fixture();
    // verificar si existe un partido con matchday 38 y está jugado
    return fixture.some(m => m.matchday === 38 && m.played);
  });

  protected readonly champion = computed(() => {
  if (!this.isSeasonFinished()) return null;

  const standings = [...this.gameState.standings()];
  const teams = this.gameState.teams();

  // ORDEN REAL DE TABLA (exacto al que usás en TablaComponent)
  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;

    const dgA = a.goalsFor - a.goalsAgainst;
    const dgB = b.goalsFor - b.goalsAgainst;
    if (dgB !== dgA) return dgB - dgA;

    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;

    const nameA = teams.find(t => t.id === a.teamId)?.name ?? '';
    const nameB = teams.find(t => t.id === b.teamId)?.name ?? '';
    return nameA.localeCompare(nameB);
  });

  const championTeamId = standings[0].teamId;

  return teams.find(t => t.id === championTeamId);
});


  getTeamLogo(teamId: number): string {
    return `/logos/${teamId}.png`;
  }

  handleMissingImage(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/logos/default.png'; 
  }
}
