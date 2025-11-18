import { Component, inject } from '@angular/core';
import { TeamsService } from '../../equipos/teams-service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-inicio-component',
  imports: [RouterLink],
  templateUrl: './inicio-component.html',
  styleUrl: './inicio-component.css',
})
export class InicioComponent {
  private readonly service = inject(TeamsService)
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute);
  // sacamos el ID del equipo de la url
  protected readonly teamId = Number(this.route.snapshot.paramMap.get('id'));

 
}
