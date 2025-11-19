import { Component, inject } from '@angular/core';
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

  protected readonly teamId = Number(this.route.snapshot.paramMap.get('id'));

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

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
