import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { DataService } from '../services/data-service';
import { Teams } from '../models/teams';
import { Player } from '../models/player';

@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './player-list-component.html',
  styleUrls: ['./player-list-component.css']
})
export class PlayerListComponent implements OnInit {
  team: Teams | undefined;
  teamId: number = 0;

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute, // Para obtener parámetros de la URL
    private router: Router
  ) { }

  ngOnInit(): void {
    // 1. Obtener el teamId de la URL (ruta: /teams/:teamId/players)
    this.route.paramMap.subscribe(params => {
      this.teamId = +params.get('teamId')!;
      this.loadTeamPlayers();
    });
  }

  loadTeamPlayers(): void {
    // 2. Cargar todos los equipos y encontrar el equipo actual
    this.dataService.getTeams().subscribe(teams => {
      this.team = teams.find(t => t.id === this.teamId);
      if (!this.team) {
        alert('Equipo no encontrado. Volviendo a la lista de equipos.');
        this.router.navigate(['/teams']);
      }
    });
  }

  // Operación Baja (Delete)
  deletePlayer(playerId: number): void {
    if (confirm('¿Deseas eliminar a este jugador?')) {
      this.dataService.deletePlayer(this.teamId, playerId).subscribe(success => {
        if (success && this.team) {
          // 3. Actualizar la lista en pantalla
          this.team.squad = this.team.squad.filter(p => p.id !== playerId);
        }
      });
    }
  }

  // Navega al formulario de edición de jugador
  goToEditPlayer(playerId: number): void {
    // Ruta: /teams/1/players/edit/101
    this.router.navigate(['/teams', this.teamId, 'players', 'edit', playerId]);
  }
}