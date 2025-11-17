import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para usar *ngFor
import { RouterModule, Router } from '@angular/router'; // Para la navegación

import { DataService } from '../services/data-service';
import { Teams } from '../models/teams'; // Importamos la interfaz Team

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './team-list-component.html',
  styleUrls: ['./team-list-component.css']
})
export class TeamListComponent implements OnInit {
  teams: Teams[] = [];

  constructor(private dataService: DataService, private router: Router) { }

  ngOnInit(): void {
    // 1. Llama al servicio para obtener los datos al iniciar el componente
    this.dataService.getTeams().subscribe(data => {
      this.teams = data;
    });
  }
  
  // Operación Baja (Delete)
  deleteTeam(teamId: number): void {
    if (confirm('¿Estás seguro de eliminar este equipo?')) {
      this.dataService.deleteTeam(teamId).subscribe(success => {
        if (success) {
          // 2. Actualiza la lista en la interfaz
          this.teams = this.teams.filter(t => t.id !== teamId); 
          console.log(`Equipo ${teamId} eliminado.`);
        }
      });
    }
  }

  // Navega al formulario de edición
  goToEdit(teamId: number): void {
    this.router.navigate(['/teams/edit', teamId]);
  }
}