import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { DataService } from '../services/data-service';
import { Player } from '../models/player';

@Component({
  selector: 'app-player-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './player-form-component.html',
  styleUrls: ['./player-form-component.css']
})
export class PlayerFormComponent implements OnInit {
  // Objeto Player inicializado con valores por defecto
  player: Player = { id: 0, name: '', position: 'FW', rating: 50, shirtNumber: 0, isStarter: false, stats: { goals: 0, assists: 0, matches: 0, starts: 0, yellowCards: 0, redCards: 0 } };
  
  teamId: number = 0;
  isEditMode = false;

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // 1. Obtener ambos IDs de la URL
    this.route.paramMap.subscribe(params => {
      this.teamId = +params.get('teamId')!;
      const playerId = params.get('playerId');

      if (playerId) {
        this.isEditMode = true;
        const pId = +playerId;
        
        // 2. Si existe playerId, cargar datos del jugador para Modificación (U)
        this.dataService.getPlayer(this.teamId, pId).subscribe(playerData => {
            if (playerData) {
                this.player = {...playerData};
            }
        });
      }
    });
  }

  // Operación Alta (Create) / Modificación (Update)
  savePlayer(): void {
    if (this.isEditMode) {
      // 3. Modo Modificación (Update)
      this.dataService.updatePlayer(this.teamId, this.player).subscribe(() => {
        alert(`Jugador ${this.player.name} actualizado.`);
        this.router.navigate(['/teams', this.teamId, 'players']); // Vuelve a la plantilla
      });
    } else {
      // 4. Modo Alta (Create)
      const { id, stats, ...newPlayerData } = this.player;
      
      this.dataService.addPlayerToTeam(this.teamId, newPlayerData as Omit<Player, 'id' | 'stats'>).subscribe(() => {
        alert('Jugador creado.');
        this.router.navigate(['/teams', this.teamId, 'players']); // Vuelve a la plantilla
      });
    }
  }
}