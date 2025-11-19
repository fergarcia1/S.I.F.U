import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-menu-simulacion',
  imports: [],
  templateUrl: './menu-simulacion.html',
  styleUrl: './menu-simulacion.css',
})
export class MenuSimulacion {

  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute);

  protected readonly teamId = Number(this.route.snapshot.paramMap.get('id') ?? 0);

  navigateToSimulacionPartido(id : number) {
    this.router.navigateByUrl(`/simulacionPartido/${id}`);
  }
  
  navigateToSimulacionPartidoRapido(id : number) {
    this.router.navigateByUrl(`/simulacionPartidoRapido/${id}`);
  }

  navigateToMenuInicio(id : number) {
    this.router.navigateByUrl(`/inicio/${id}`);
  }
}