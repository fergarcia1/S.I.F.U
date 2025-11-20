import { Component, computed, inject } from '@angular/core';
import { Location } from '@angular/common';
import { TeamsService } from '../../equipos/teams-service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth-service';
import { GameStateService } from '../game-state-service';
import { simulateFullMatch } from '../../utils/simulation';


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
  private readonly gameState = inject(GameStateService);

  protected readonly teamId = this.gameState.selectedTeamId();
  protected readonly teams = computed(() => this.gameState.getState()?.teams ?? []);

  constructor() {
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

    // buscar el siguiente partido NO jugado donde participe este equipo
    const next = fixture
      .filter(m => !m.played && (m.homeTeamId === myTeamId || m.awayTeamId === myTeamId))
      .sort((a, b) => a.matchday - b.matchday)[0]; 

    if (!next) return null;

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

    // orden de tabla 
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

    const myPos = standings.findIndex(s => s.teamId === this.teamId) + 1;
    const rivalPos = standings.findIndex(s => s.teamId === next.rivalTeamId) + 1;

    return { myPos, rivalPos };
  });


  protected readonly myTeamName = computed(() => {
    return this.teams().find(t => t.id === this.teamId)?.name ?? '';
  });

  protected readonly isSeasonFinished = computed(() => {
    const fixture = this.gameState.fixture();
    return fixture.some(m => m.matchday === 38 && m.played);
  });

  protected readonly champion = computed(() => {
  if (!this.isSeasonFinished()) return null;

  const standings = [...this.gameState.standings()];
  const teams = this.gameState.teams();

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

  simulateFullSeason() {
  const fixture = this.gameState.fixture();

  // iterar por los partidos NO jugados
  for (const match of fixture) {
    if (!match.played) {
      const home = this.gameState.getTeamById(match.homeTeamId);
      const away = this.gameState.getTeamById(match.awayTeamId);

      if (!home || !away) continue;

      const result = simulateFullMatch(match, home, away);

      // actualizar estado global
      this.gameState.updateMatchResult(match.id, result);
    }
  }
}

}
