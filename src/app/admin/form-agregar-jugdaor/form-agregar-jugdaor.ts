import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamsService } from '../../equipos/teams-service';
import { Teams } from '../../models/teams';
import { Player } from '../../models/player';
import { PlayerStats } from '../../models/player-stats';

@Component({
  selector: 'app-form-agregar-jugdaor',
  imports: [ReactiveFormsModule],
  templateUrl: './form-agregar-jugdaor.html',
  styleUrl: './form-agregar-jugdaor.css',
})
export class FormAgregarJugdaor {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(TeamsService);
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)

  public readonly jugadorAgregadoOModificado = output<Player>();
  public readonly jugador = input<Player>();
  public readonly teamModificado = output<Teams>();
  public readonly team = input<Teams>();
  public readonly editando = input(false);

  protected readonly playerStats = {
    goals: 0,
    assists: 0,
    matches: 0,
    starts: 0,
    yellowCards: 0,
    redCards: 0
  }

  protected readonly form = this.fb.nonNullable.group({
    teamId: [0, [Validators.required]], // El equipo al que pertenece
    name: ['', [Validators.required, Validators.minLength(3)]],
    position: ['', [Validators.required]], // Valor por defecto GK
    rating: [60, [Validators.required, Validators.min(1), Validators.max(99)]],
    shirtNumber: [0, [Validators.required, Validators.min(1), Validators.max(99)]],
    isStarter: [false, [Validators.required]], // Lo manejamos como string en el select, luego convertimos
    stats: [this.playerStats]
  });

  protected readonly tipoDePosiciones = [
    'GK' , 'DF' , 'MF' , 'FW'
  ]
  protected readonly equiposDisponibles = [{
    id: "1",
    name: "Manchester City",
  },
  {
    id: "2",
    name: "Liverpool",
  },
  {
    id: "3",
    name: "Manchester United",
  },
  {
    id: "4",
    name: "Arsenal",
  },
  {
    id: "5",
    name: "Chelsea",
  },
  {
    id: "6",
    name: "Tottenham Hotspur",
  },
  {
    id: "7",
    name: "Newcastle United",
  },
  {
    id: "8",
    name: "Aston Villa",
  },
  {
    id: "9",
    name: "Brighton & Hove Albion",
  },
  {
    id: "10",
    name: "West Ham United",
  },
  {
    id: "11",
    name: "Crystal Palace",
  },
  {
    id: "12",
    name: "Fulham",
  },
  {
    id: "13",
    name: "Brentford",
  },
  {
    id: "14",
    name: "AFC Bournemouth",
  },
  {
    id: "15",
    name: "Wolverhampton Wanderers",
  },
  {
    id: "16",
    name: "Nottingham Forest",
  },
  {
    id: "17",
    name: "Everton",
  },
  {
    id: "18",
    name: "Burnley",
  },
  {
    id: "19",
    name: "Sheffield United",
  },
  {
    id: "20",
    name: "Luton Town",
  },
  ]



  get teamId() {
    return this.form.controls.teamId;
  }

  get name() {
    return this.form.controls.name;
  }

  get position() {
    return this.form.controls.position;
  }

  get rating() {
    return this.form.controls.rating;
  }

  get shirtNumber() {
    return this.form.controls.shirtNumber;
  }

  get isStarter() {
    return this.form.controls.isStarter
  }

  handleSubmit() {
    if (this.form.invalid) {
      alert(`FORMULARIO INVALIDO!!!!`)
      return;
    }

    // 1. Obtenemos los valores crudos (Raw)
      const rawValues = this.form.getRawValue();
      
      // 2. CORRECCIÓN: Construir el jugador manualmente para darle un ID
      const nuevoJugador: Player = {
        id: Date.now(), // Generamos ID único aquí
        name: rawValues.name,
        position: rawValues.position as 'GK' | 'DF' | 'MF' | 'FW',
        rating: rawValues.rating,
        shirtNumber: rawValues.shirtNumber,
        isStarter: rawValues.isStarter,
        stats: rawValues.stats
      };

    if (confirm(`Desea Confirmar los Datos?`)) {

      const id = this.jugador()?.id;
      const idEquipo = Number(this.teamId.value)

      if (!this.editando()) {
        this.service.addPlayerToTeam(idEquipo, nuevoJugador).subscribe(() => {
          this.jugadorAgregadoOModificado.emit(nuevoJugador);
          this.form.reset();
        })
      }

    }
  }



}
