import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ¡NECESARIO para formularios!
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { DataService } from '../services/data-service';
import { Teams } from '../models/teams';

@Component({
  selector: 'app-team-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // Asegúrate de importar FormsModule
  templateUrl: './team-form-component.html',
  styleUrls: ['./team-form-component.css']
})
export class TeamFormComponent implements OnInit {
  // Inicialización del objeto Team para el formulario
  team: Teams = { id: 0, name: '', shortName: '', logo: '', squad: [] };
  isEditMode = false;

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // 1. Obtener el parámetro 'id' de la ruta (si existe)
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        const teamId = +id; // Convierte a número
        
        // 2. Si existe ID, cargar datos para la edición
        this.dataService.getTeams().subscribe(teams => {
            const currentTeam = teams.find(t => t.id === teamId);
            if (currentTeam) {
                this.team = {...currentTeam}; // Clonamos el objeto
            }
        });
      }
    });
  }

  // Operación Alta (Create) / Modificación (Update)
  saveTeam(): void {
    if (this.isEditMode) {
      // Modificación (Update)
      this.dataService.updateTeam(this.team).subscribe(() => {
        alert(`Equipo ${this.team.name} actualizado.`);
        this.router.navigate(['/teams']);
      });
    } else {
      // Alta (Create)
      // El servicio se encarga de asignar el ID y el squad vacío
      const { name, shortName, logo } = this.team;
      this.dataService.addTeam({ name, shortName, logo }).subscribe(() => {
        alert('Equipo creado con éxito!');
        this.router.navigate(['/teams']);
      });
    }
  }
}