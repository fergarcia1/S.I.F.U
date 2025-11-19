import { Injectable, inject } from '@angular/core';
import { SaveService } from './save-service';
import { Saves } from '../models/saves';

@Injectable({
  providedIn: 'root'
})
export class SaveActualService {

  private currentSaveInternal: Saves | null = null;
  private readonly saveService = inject(SaveService);

  setSave(save: Saves) {
    this.currentSaveInternal = save;
  }

  currentSave() {
    return this.currentSaveInternal;
  }

  // ⭐ AUTOSAVE ⭐
  autosave(gameState: {
    teams: any;
    standings: any;
    fixture: any;
    currentMatchday: number;
  }) {
    if (!this.currentSaveInternal) return;

    const updated: Saves = {
      ...this.currentSaveInternal,
      modifiedTeams: gameState.teams,
      standings: gameState.standings,
      fixture: gameState.fixture,
      currentMatchday: gameState.currentMatchday,
      updatedAt: new Date().toISOString()
    };

    // Actualizo memoria
    this.currentSaveInternal = updated;

    // Guardo en JSON Server
    this.saveService.update(updated).subscribe();
  }
}
