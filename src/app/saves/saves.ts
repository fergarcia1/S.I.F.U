import { Component, computed, inject, signal } from '@angular/core';
import { SaveService } from '../saves/save-service';
import { AuthService } from '../auth/auth-service';
import { SaveActualService } from './save-actual-service';
import { Saves } from '../models/saves';
import { Router, RouterLink } from '@angular/router';
import { GameStateService } from '../menu-jugar/game-state-service';
import { DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importar FormsModule
import { TeamsService } from '../equipos/teams-service'; // Necesario para nombres de equipos
import { Teams } from '../models/teams';
import { Location } from '@angular/common';

@Component({
  selector: 'app-saves',
  standalone: true,
  imports: [DatePipe, CommonModule, FormsModule, RouterLink],
  templateUrl: './saves.html',
  styleUrl: './saves.css' // Asegúrate de vincular el CSS
})
export class SavesComponent {
  private readonly location = inject(Location);
  private readonly saveService = inject(SaveService);
  private readonly auth = inject(AuthService);
  private readonly currentSave = inject(SaveActualService);
  private readonly gameState = inject(GameStateService);
  private readonly router = inject(Router);
  private readonly teamsService = inject(TeamsService); // Inyectamos para nombres

  // SEÑALES
  saves = this.saveService.saves; // Señal original del servicio
  searchTerm = signal<string>(''); // Señal para el buscador
  teamsList = signal<Teams[]>([]); // Señal para la lista de equipos (para buscar nombres)

  constructor() {
    const userId = this.auth.getUser()!.id;
    this.saveService.loadAll(userId);
    
    // Cargamos los equipos para poder mostrar sus nombres en las tarjetas
    this.teamsService.getAllTeams().subscribe(teams => {
      this.teamsList.set(teams);
    });
  }

  // LOGICA DE FILTRADO
  filteredSaves = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const allSaves = this.saves();
    const teams = this.teamsList();

    if (!term) return allSaves;

    return allSaves.filter(save => {
      // Buscamos el nombre del equipo asociado a este save
      const teamName = teams.find(t => t.id === save.teamId)?.name.toLowerCase() || '';
      // Filtramos si el nombre del equipo incluye el término de búsqueda
      return teamName.includes(term);
    });
  });

  // HELPER PARA OBTENER NOMBRE EN EL HTML
  getTeamName(teamId: number): string {
    return this.teamsList().find(t => t.id === teamId)?.name || 'Equipo Desconocido';
  }
  
  handleMissingImage(event: Event) {
    (event.target as HTMLImageElement).src = '/logos/default.png';
  }

  deleteSave(id: number) {
    if(confirm("¿Estás seguro de borrar esta partida?")) {
        this.saveService.delete(id).subscribe(() => {
        this.saveService.saves.update((saves) => saves.filter((s) => s.id !== id));
        });
    }
  }

  load(save: Saves) {
    this.currentSave.setSave(save);
    this.gameState.selectedTeamId.set(save.teamId);
    // ... (resto de tu lógica de carga de estado) ...
    // Nota: Asegúrate de que 'save.modifiedTeams' exista y sea correcto
    // Si no, deberías cargar los equipos frescos o del save
    
    this.router.navigate([`/inicio/${save.teamId}`]);
  }
  goBack() {
    this.location.back();
  }
}