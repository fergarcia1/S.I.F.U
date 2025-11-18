import { Component, computed, inject } from '@angular/core';
import { GameStateService } from '../../menu-jugar/game-state-service';
import { CommonModule } from '@angular/common';
import { Teams } from '../../models/teams';

@Component({
  selector: 'app-tabla-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabla-component.html',
  styleUrls: ['./tabla-component.css']
})
export class TablaComponent {

  private readonly gameState = inject(GameStateService);

  // Acceso a la tabla desde el estado global
  readonly standings = computed(() => this.gameState.standings());

  // Equipos (para mostrar el nombre/escudo)
  readonly teams = computed(() => this.gameState.teams());

  // Tabla ordenada con reglas reales
  readonly sortedStandings = computed(() => {
    return [...this.standings()].sort((a, b) => {
      // 1) Puntos
      if (b.points !== a.points) return b.points - a.points;

      // 2) Diferencia de gol
      const dgA = a.goalsFor - a.goalsAgainst;
      const dgB = b.goalsFor - b.goalsAgainst;
      if (dgB !== dgA) return dgB - dgA;

      // 3) Goles a favor
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;

      // 4) Nombre del equipo alfabéticamente
      const teamA = this.teams().find(t => t.id === a.teamId)?.name ?? '';
      const teamB = this.teams().find(t => t.id === b.teamId)?.name ?? '';

      return teamA.localeCompare(teamB);
    });
  });

  getTeamName(id: number): string {
    return this.teams().find(t => t.id === id)?.name ?? 'Equipo';
  }

  getTeamShortName(id: number): string {
    return this.teams().find(t => t.id === id)?.shortName ?? '';
  }

  getTeamLogo(id: number): string {
    return this.teams().find(t => t.id === id)?.logo ?? '';
  }
}
