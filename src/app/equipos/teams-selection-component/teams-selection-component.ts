import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { Teams } from '../../models/teams';
import { TeamsService } from '../teams-service';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameStateService } from '../../menu-jugar/game-state-service';
import { generateFixture } from '../../utils/generate-fixture';
import { Saves } from '../../models/saves';
import { SaveService } from '../../saves/save-service';
import { AuthService } from '../../auth/auth-service';


@Component({
  selector: 'app-teams-selection-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './teams-selection-component.html',
  styleUrl: './teams-selection-component.css',
})
export class TeamsSelectionComponent {
  ///servicios
  private readonly service = inject(TeamsService)
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute);
  private readonly teamId = Number(this.route.snapshot.paramMap.get('id'));
  private readonly gameState = inject(GameStateService);
  private readonly saveService = inject(SaveService);
  private readonly auth = inject(AuthService);


  //obtencion de datos 
  protected readonly teamsSource = toSignal(this.service.getAllTeams())
  protected readonly teams = linkedSignal(() => this.teamsSource() ?? [])

  ///validaciones
  protected readonly isLoading = computed(() => this.teams() === undefined)

  //filtrado
  protected searchTerm = signal<string>('');

  protected readonly filteredTeams = computed(() => {
    const teams = this.teamsSource() ?? [];
    const term = this.searchTerm().toLowerCase();
    if (!term) return teams; // si no escribio nada, devuelve todo
    return teams.filter(team =>  //filtra por nombre completo o abreviatura 
      team.name.toLowerCase().includes(term) ||
      team.shortName.toLowerCase().includes(term)
    );
  });

  startNewGame(id: number) {
    const teams = this.teamsSource()!;
    const fixture = generateFixture(teams);


    this.gameState.startNewGame({
      selectedTeamId: id,
      teams: teams,
      fixture: fixture
    });

    const now = new Date().toISOString();

     const newSave: Saves = {
      id: Date.now(),
      userId: this.auth.getUser()!.id,
      teamId: id,
      currentMatchday: 1,

      standings: this.gameState.createInitialStandings(teams),
      modifiedTeams: teams,          // PLANTELES INICIALES
      fixture: fixture,              // FIXTURE GENERADO

      createdAt: now,
      updatedAt: now,
    };

    // Guardar partida en JSON-server
    this.saveService.create(newSave).subscribe(() => {
      // lo agregamos al signal
      this.saveService.saves.update(s => [...s, newSave]);

      // Navegar al menú del DT
      this.router.navigateByUrl(`/inicio/${id}`);
    });
  }

  navigateToPlantel(id: number) {
    this.router.navigateByUrl(`/listaTeams/${id}`);
  }

  getTeamLogo(teamId: number): string {
    return `/logos/${teamId}.png`;
  }

  handleMissingImage(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/logos/default.png'; 
  }
}


