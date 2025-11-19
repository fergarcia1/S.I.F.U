import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Sifu');
  private router = inject(Router);

  // 1. Creamos una señal privada para la URL actual
  private currentUrl = signal<string>('');

  // 2. Creamos una señal pública que nos dice si estamos en una página de "autenticación"
  readonly isAuthPage = computed(() => {
    const url = this.currentUrl();
    return url === '/login' || url === '/register';
  });

  constructor() {
    // 3. Escuchamos los eventos del router
    this.router.events.pipe(
      // Filtramos solo los eventos de 'NavigationEnd'
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // 4. Actualizamos la señal con la nueva URL
      this.currentUrl.set(event.urlAfterRedirects);
    });
  }
}
