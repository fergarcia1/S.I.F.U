import { Component, inject } from '@angular/core';
import { SaveService } from '../saves/save-service';
import { AuthService } from '../auth/auth-service';
import { MenuComponent } from '../menu-principal/menu-principal.component';
import { SaveActualService } from './save-actual-service';
import { Saves } from '../models/saves';
import { Router } from '@angular/router';
import { GameStateService } from '../menu-jugar/game-state-service';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-saves',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './saves.html',
})
export class SavesComponent {
  private readonly saveService = inject(SaveService);
  private readonly auth = inject(AuthService);
  private readonly currentSave = inject(SaveActualService);
  private readonly gameState = inject(GameStateService);
  private readonly router = inject(Router);

  saves = this.saveService.saves;

  constructor() {
    const userId = this.auth.getUser()!.id;
    this.saveService.loadAll(userId);
  }

  deleteSave(id: number) {
    this.saveService.delete(id).subscribe(() => {
      this.saveService.saves.update((saves) => saves.filter((s) => s.id !== id));
    });
  }

  load(save: Saves) {
    // Setear el save en la señal global
    this.currentSave.setSave(save);

    // Restaurar estado real
    this.gameState.selectedTeamId.set(save.teamId);
    this.gameState.teams.set(save.modifiedTeams);
    this.gameState.fixture.set(save.fixture);
    this.gameState.standings.set(save.standings);

    // Navegar al menú principal del DT
    this.router.navigate([`/inicio/${save.teamId}`]);
  }
}
